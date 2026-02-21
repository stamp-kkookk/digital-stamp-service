# KKOOKK AWS 인프라 온보딩 가이드

## 개요
이 문서는 KKOOKK 디지털 스탬프 서비스를 AWS에 배포하기 위한 전체 과정을 안내한다.

---

## Phase 0: 로컬 도구 설치

### 0-1. Terraform 설치
```bash
# Windows (winget)
winget install HashiCorp.Terraform

# 설치 확인
terraform -version   # >= 1.5.0
```

### 0-2. AWS CLI 설치
```bash
# Windows (winget)
winget install Amazon.AWSCLI

# 설치 확인
aws --version   # >= 2.x
```

### 0-3. AWS CLI 프로필 설정
```bash
aws configure
# AWS Access Key ID: <IAM 사용자의 Access Key>
# AWS Secret Access Key: <IAM 사용자의 Secret Key>
# Default region: ap-northeast-2
# Default output format: json
```

> **IAM 사용자 권한:** AdministratorAccess 또는 최소한 EC2, VPC, RDS, S3, CloudFront, Route53, IAM, SSM, CloudWatch 권한 필요

---

## Phase 1: AWS 콘솔 사전 작업

### 1-1. EC2 Key Pair 생성
AWS Console → EC2 → Key Pairs → Create key pair
- Name: `kkookk-key`
- Type: RSA
- Format: `.pem`
- 다운로드한 파일을 `~/.ssh/kkookk-key.pem`에 저장

```bash
# 권한 설정 (Git Bash 또는 WSL)
chmod 400 ~/.ssh/kkookk-key.pem
```

### 1-2. (선택) Route 53 Hosted Zone 생성
커스텀 도메인을 사용하는 경우:
- AWS Console → Route 53 → Hosted Zones → Create
- Domain name: `kkookk.com` (본인 도메인)
- 생성 후 Zone ID를 메모

---

## Phase 2: Terraform 변수 설정

### 2-1. terraform.tfvars 생성
```bash
cd infra/
cp terraform.tfvars.example terraform.tfvars
```

### 2-2. 변수 값 수정
`terraform.tfvars` 파일을 열어 실제 값으로 교체:

```hcl
aws_region      = "ap-northeast-2"
key_pair_name   = "kkookk-key"
allowed_ssh_cidrs = ["YOUR_PUBLIC_IP/32"]   # https://checkip.amazonaws.com 에서 확인
domain_name     = "kkookk.com"              # 또는 "" (CloudFront 기본 도메인 사용)
route53_zone_id = ""                        # Route 53 Zone ID (없으면 빈값)
db_username     = "kkookkuser"
db_password     = "강력한_비밀번호_여기에"
db_name         = "kkookkdb"
```

---

## Phase 3: Terraform 인프라 배포

### 3-1. 초기화
```bash
cd infra/
terraform init
```

### 3-2. 실행 계획 검토
```bash
terraform plan
```
생성될 리소스 목록을 확인하고 이상 없으면 다음 단계 진행.

### 3-3. 인프라 생성
```bash
terraform apply
```
`yes` 입력하여 승인. (~5-10분 소요, RDS가 가장 오래 걸림)

### 3-4. 출력값 확인 및 저장
```bash
terraform output
```
다음 값들을 메모:
- `bastion_public_ip` — SSH 접속용
- `backend_private_ip` — Gateway nginx 설정에 필요
- `monitoring_private_ip` — 모니터링 접근에 필요
- `rds_endpoint` — Backend .env에 필요
- `cloudfront_domain` — 서비스 접속 URL
- `s3_frontend_bucket` — GitHub Secrets에 필요
- `s3_artifacts_bucket` — GitHub Secrets에 필요

---

## Phase 4: 서버 초기 설정

### 4-1. SSH Config 설정
`~/.ssh/config` 파일에 추가 (terraform output ssh_config 참고):

```
Host kkookk-bastion
    HostName <BASTION_PUBLIC_IP>
    User ubuntu
    IdentityFile ~/.ssh/kkookk-key.pem

Host kkookk-backend
    HostName <BACKEND_PRIVATE_IP>
    User ubuntu
    IdentityFile ~/.ssh/kkookk-key.pem
    ProxyJump kkookk-bastion

Host kkookk-monitoring
    HostName <MONITORING_PRIVATE_IP>
    User ubuntu
    IdentityFile ~/.ssh/kkookk-key.pem
    ProxyJump kkookk-bastion
```

### 4-2. Gateway nginx에 Backend IP 설정
```bash
ssh kkookk-bastion
sudo sed -i 's/BACKEND_PRIVATE_IP/<실제_BACKEND_IP>/' /etc/nginx/sites-available/gateway
sudo nginx -t && sudo nginx -s reload
exit
```

### 4-3. Backend .env 설정
```bash
ssh kkookk-backend
sudo cp /opt/kkookk/.env.template /opt/kkookk/.env
sudo nano /opt/kkookk/.env
```

아래 값들을 실제 값으로 교체:
- `DB_URL` — RDS endpoint 대입
- `DB_PASSWORD` — RDS 비밀번호
- `JWT_SECRET` — 256bit 시크릿 (openssl rand -hex 32로 생성)
- `QR_BASE_URL` — CloudFront URL (https://xxx.cloudfront.net)
- `LOKI_URL` — 이미 설정됨 (monitoring IP)
- OAuth 클라이언트 ID/Secret (Google, Kakao, Naver)

### 4-4. 모니터링 설정 파일 복사
로컬에서 실행:
```bash
# 모니터링 설정 파일 복사
scp -r backend/docker/monitoring/* kkookk-monitoring:/tmp/monitoring/
scp backend/docker-compose.monitoring.yml kkookk-monitoring:/tmp/docker-compose.yml
```

Monitoring 서버에서:
```bash
ssh kkookk-monitoring
sudo cp -r /tmp/monitoring/* /opt/monitoring/
sudo cp /tmp/docker-compose.yml /opt/monitoring/docker-compose.yml

# docker-compose.yml 볼륨 경로를 /opt/monitoring/으로 수정
# prometheus.yml에서 backend scrape target IP 수정

cd /opt/monitoring
sudo docker compose up -d
```

---

## Phase 5: GitHub Secrets 설정

GitHub 리포지토리 → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | 값 |
|------------|-----|
| `AWS_ACCESS_KEY_ID` | IAM Access Key |
| `AWS_SECRET_ACCESS_KEY` | IAM Secret Key |
| `S3_ARTIFACTS_BUCKET` | terraform output s3_artifacts_bucket |
| `S3_FRONTEND_BUCKET` | terraform output s3_frontend_bucket |
| `BACKEND_INSTANCE_ID` | Backend EC2 Instance ID (AWS Console에서 확인) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront Distribution ID (AWS Console에서 확인) |
| `SLACK_CI_WEBHOOK` | (선택) Slack Webhook URL |

---

## Phase 6: 첫 배포 테스트

### 6-1. Backend 수동 배포 (로컬에서)
```bash
cd backend/
./gradlew build -x test --no-daemon

# JAR를 S3에 업로드
aws s3 cp build/libs/kkookk-*.jar s3://<ARTIFACTS_BUCKET>/backend/kkookk-latest.jar --exclude "*plain*"

# SSM으로 배포 실행
aws ssm send-command \
  --instance-ids "<BACKEND_INSTANCE_ID>" \
  --document-name "AWS-RunShellScript" \
  --parameters 'commands=["/opt/kkookk/deploy.sh backend/kkookk-latest.jar"]'
```

### 6-2. Frontend 수동 배포 (로컬에서)
```bash
cd frontend/
npm ci
VITE_API_BASE_URL="" npm run build
aws s3 sync dist/ s3://<FRONTEND_BUCKET>/ --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

### 6-3. 동작 확인
```bash
# Frontend 로드
curl -I https://<CLOUDFRONT_DOMAIN>/

# API 헬스체크
curl https://<CLOUDFRONT_DOMAIN>/api/public/health

# Grafana (SSH 터널)
ssh -L 3000:<MONITORING_IP>:3000 kkookk-bastion
# 브라우저에서 http://localhost:3000 접속
```

---

## Phase 7: CI/CD 자동 배포 확인

1. `develop` 브랜치에서 backend/ 또는 frontend/ 코드 변경
2. `main` 브랜치로 PR 생성 → CI 통과 확인
3. PR merge → CD 자동 실행 확인
4. GitHub Actions 탭에서 배포 로그 확인

---

## 월간 비용 요약

| 항목 | 월 비용 |
|------|:------:|
| Gateway (t4g.micro) | $6 |
| Backend (t4g.small) | $12 |
| Monitoring (t4g.micro) | $6 |
| RDS (db.t4g.micro) | $13 |
| EBS (40GB gp3) | $3.20 |
| S3 + CloudFront | $1 |
| Route 53 | $1 |
| **합계** | **~$42/월** |

---

## 문제 해결

### Private EC2 인터넷 안됨
Gateway NAT가 제대로 동작하는지 확인:
```bash
ssh kkookk-bastion
sudo iptables -t nat -L -v   # MASQUERADE 규칙 확인
cat /proc/sys/net/ipv4/ip_forward   # 1이어야 함
```

### Backend 배포 실패
```bash
ssh kkookk-backend
docker logs kkookk-blue   # 또는 kkookk-green
sudo /opt/kkookk/rollback.sh   # 이전 버전으로 롤백
```

### CloudFront 403 에러
S3 버킷 정책과 OAC 설정 확인. `index.html`이 S3에 존재하는지 확인.
