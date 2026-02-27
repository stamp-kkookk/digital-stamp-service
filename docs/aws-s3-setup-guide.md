# 이미지 저장소 S3 전환 가이드

> 매장 아이콘 등 이미지를 운영 서버에서 AWS S3에 저장하기 위한 설정입니다.
> 코드는 이미 준비되어 있고, **AWS 쪽 설정 + 환경 변수 추가**만 하면 됩니다.

---

## 한눈에 보는 체크리스트

- [ ] **1단계** — S3 버킷 만들기
- [ ] **2단계** — 서버가 버킷에 접근할 수 있도록 IAM 권한 부여
- [ ] **3단계** — 운영 서버에 환경 변수 3개 추가
- [ ] (선택) CloudFront 연결

---

## 1단계: S3 버킷 만들기

**AWS 콘솔 > S3 > 버킷 만들기**

| 항목 | 값 |
|------|----|
| 버킷 이름 | `kkookk-images` (원하는 이름으로 변경 가능) |
| 리전 | 아시아 태평양(서울) `ap-northeast-2` |
| 퍼블릭 액세스 | **모든 퍼블릭 액세스 차단** 체크 (기본값 유지) |

> 나머지 설정은 기본값 그대로 두고 "버킷 만들기" 클릭하면 됩니다.

### 퍼블릭 읽기 허용 (CloudFront를 안 쓸 경우만)

CloudFront 없이 S3 URL로 이미지를 직접 보여주려면, 버킷 > 권한 > 버킷 정책에 아래를 붙여넣기:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::kkookk-images/*"
    }
  ]
}
```

> `kkookk-images`를 실제 버킷 이름으로 바꿔주세요.

---

## 2단계: 서버에 S3 접근 권한 부여

우리 백엔드 서버가 S3에 이미지를 올리고/읽고/삭제할 수 있어야 합니다.

### 방법 A: EC2/ECS에 IAM 역할 붙이기 (권장)

서버가 EC2나 ECS에서 돌아가고 있다면, 해당 인스턴스/태스크의 **IAM 역할**에 아래 정책을 추가합니다.

**AWS 콘솔 > IAM > 역할 > (서버 역할 선택) > 권한 추가 > 인라인 정책 생성 > JSON 탭**에 붙여넣기:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::kkookk-images/*"
    }
  ]
}
```

### 방법 B: 액세스 키 사용 (EC2/ECS가 아닌 환경)

**AWS 콘솔 > IAM > 사용자 > 보안 자격 증명 > 액세스 키 만들기**

발급받은 키를 서버 환경 변수에 추가:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## 3단계: 운영 서버 환경 변수 추가

서버 환경(Docker, EC2, ECS 등)에 아래 값을 추가합니다:

```
S3_BUCKET=kkookk-images
S3_REGION=ap-northeast-2
```

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `S3_BUCKET` | O | 1단계에서 만든 버킷 이름 |
| `S3_REGION` | X | 버킷 리전 (기본값: `ap-northeast-2`) |
| `CLOUDFRONT_DOMAIN` | X | CloudFront를 쓸 경우에만 (예: `d1234.cloudfront.net`) |

> `spring.profiles.active=prod`가 설정되어 있어야 S3 모드로 동작합니다.
> (`local` 프로파일에서는 기존처럼 로컬 파일시스템을 사용합니다)

---

## (선택) CloudFront 연결

CloudFront를 붙이면 이미지 로딩이 빨라지고 HTTPS가 자동 적용됩니다.

1. **AWS 콘솔 > CloudFront > 배포 생성**
2. 원본 도메인: `kkookk-images.s3.ap-northeast-2.amazonaws.com` 선택
3. 원본 액세스: **Origin Access Control(OAC)** 선택 후 새로 생성
4. 나머지 기본값 > 배포 생성
5. 생성된 배포 도메인(예: `d1234.cloudfront.net`)을 환경 변수에 추가:
   ```
   CLOUDFRONT_DOMAIN=d1234.cloudfront.net
   ```

---

## 이미지 URL이 만들어지는 방식

| 설정 | 이미지 URL 예시 |
|------|----------------|
| CloudFront 있음 | `https://d1234.cloudfront.net/stores/icons/abc.jpg` |
| CloudFront 없음 | `https://kkookk-images.s3.ap-northeast-2.amazonaws.com/stores/icons/abc.jpg` |
| 로컬 (개발용) | `/storage/stores/icons/abc.jpg` |
