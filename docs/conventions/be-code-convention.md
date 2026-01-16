
## 코드 스타일

- 기본적으로 Google Java Code Convention을 따른다.
    - 단, 다음 항목은 별도로 적용한다.
        - 4.2 블럭 들여쓰기: +2 스페이스가 아닌 4스페이스를 사용한다.
        - 4.4 열 제한: 100 글자가 아닌 120 글자로 제한한다.
- 객체 지향 생활 체조 원칙을 지킬 수 있도록 노력한다.

## 프로덕션 영역 네이밍 규칙

- 변수 / 메서드 / 클래스에서는 camel case를 사용한다.

- 변수 / 메서드 / 클래스 네이밍에 UserList와 같이 자료구조를 직접 명시하는 것을 지양한다.

```java
// bad
LatLng // 줄임말은 허용되지 않음

// good
Position

// normal
LatitudeLongitude // 길게 표현했지만 허용
```

- 줄임말을 지양한다.
- 최대한 해당 상황을 표현하기 좋은 네이밍을 작성하되, 힘들다면 줄임말 대신 길게 표현하는 방식으로 사용한다.


- boolean 지역 변수는 is 접두사를 사용한다.
  - 예: `boolean isValid = validator.check();`

- boolean 클래스 필드에는 is 접두사를 사용하지 않는다.
  - 이유: Lombok의 `@Getter`가 자동으로 `isXxx()` 형태의 getter를 생성하기 때문
  - 예: `private boolean active;` → `isActive()` 메서드 자동 생성


- DTO는 사용 영역에 따라 접미사를 다르게 사용한다.
    - 웹 : Request/Response 접미사를 사용한다.
    - 도메인 및 서비스 : Dto 접미사를 사용한다.
 


- 조회하는 메서드의 경우 다음과 같이 네이밍을 구분해서 사용한다.
    - getter
        - Lombok의 `@Getter` 로만 사용한다.
        - private 필드의 어떠한 가공도 하지 않고 그 값을 그대로 반환할 때 사용한다.
        - DTO 변환, JSON 직렬화/역직렬화 등 인프라/표현 계층에서만 사용하며, 핵심 비즈니스 로직에서는 사용을 지양한다.
    - Repository / Service 계층 조회
      - find: 조건에 맞는 결과가 없을 수도 있는 경우 사용한다.
        - 단건 조회: Optional<T> 반환
        - 다건 조회: List<T> 반환 (결과가 없으면 빈 리스트 반환, Optional 감싸지 않는다.)
      - get: 조건에 맞는 결과가 반드시 존재해야 하는 경우 사용한다.
        - 결과가 없으면 내부에서 예외를 발생시킨다.
        - Optional을 반환하지 않고 T를 바로 반환한다.


- 다음과 같이 명확하지 않은 네이밍은 지양한다.
    - Data / Info / Item
        - 모든 것이 데이터이며 정보라고 표현할 수 있다.
        - 구체적으로 어떤 정보인지 알 수 없다.
        - 구체적인 내용을 명시한다.
            - UserData, UserInfo → UserProfile
            - ProcessItem → ProcessingTask
    - Util / Common / Global -> 하나의 클래스에 모두 담지 않기
        - 서로 관련 없는 기능들이 잡다하게 들어갈 수 있다.
        - 기능별로 명확하게 분리한다.
            - CommonUtils → StringUtils
    - Temp / Tmp / Val / Var
        - 임시라는 의미밖에 표현하지 못한다.
        - 임시로 담는 값이라도 명확하게 의미를 부여할 수 있는 네이밍을 사용한다.
            - inputString, loopIndex
    - Stream 내부 람다 표현식의 변수 네이밍 `it`
        - 해당 람다에서 사용되는 변수의 의미를 파악하기 어렵다.
        - 도메인 지식에 맞는 네이밍을 사용한다.
            - `users.stream().map(user -> ...)`

## Lombok

- 다음과 같은 기능만을 허용한다.
  - `@Getter`
  - `@Builder`
  - JPA Entity의 `@NoArgsConstructor(access = AccessLevel.PROTECTED)`
  - JPA Entity가 아닌 도메인 객체의 `@EqualsAndHashCode`
  - `@RequiredArgsConstructor`
  - `@Slf4j`

## final

- 메서드 파라미터의 경우 final 키워드를 적용하지 않는다.
- 클래스 레벨의 경우 기본적으로 final 키워드를 적용하지 않는다.
    - 해당 클래스를 확장해서는 안 된다는 것을 강조할 때만 final 키워드를 허용한다.
- 불변인 멤버 변수의 경우 final 키워드를 적용한다.
- 지역 변수의 경우 기본적으로 final 키워드를 적용하지 않는다.
    - 해당 지역 변수가 불변임을 강조할 때만 final 키워드를 허용한다.

## Annotation 규칙

```java
@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {
}
```

- Annotation은 연관이 있는 것들끼리 묶어서 표현한다.
- 연관이 있는 것들은 가독성을 고려해 길이 순서로 정렬한다.

## import 규칙

```java
// bad 
import java.util.*;

// good 
import java.util.List;
import java.util.Set;
```

- import 시 `*` 을 사용하지 않는다.

```java
// bad 
SMUGGLER

// good 
TeamRole.SMUGGLER
```

- 원칙적으로 프로덕션 코드에서 static import를 지양한다.
  - 코드의 출처를 명확히 하기 위함이다.


- 단, 다음의 경우는 예외로 static import를 허용(또는 필수로) 한다.

```java
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertAll;
```

- 테스트 영역에서는 검증 관련 로직에 한해 반드시 import static을 사용한다.

```java
import static com.example.project.domain.user.QAccount.account;
```

- Querydsl의 Q파일은 반드시 import static을 사용한다.

```java
// bad 
java.util.List<Account> accounts = new ArrayList<>();

// good 
import java.util.List;

List<Account> accounts = new ArrayList<>();
```

- FQCN은 사용하지 않는다.
- 다른 패키지에 동일한 클래스 네이밍이 있는 경우 네이밍을 적절하게 변경한다.
    - 동일한 클래스 네이밍을 만들지 않는다.

## 중괄호

```java
// bad
if (a < 0) return true;

// good 
if (a < 0) {
    return true;
}
```

- 중괄호 `{}` 는 생략할 수 없다.

## depth 제한

```java
// bad 
public boolean canDeletePost(User user, Post post) {
    if (user != null) {
        if (post != null) {
            if (user.isAdmin()) {
                return true;
            } else if (post.getAuthorId().equals(user.getId())) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// good
public boolean canDeletePost(User user, Post post) {
    if (user == null) {
        return false;
    }
    if (post == null) {
        return false;
    }
    if (user.isAdmin()) {
        if(){return true;
    }
    
    return post.isAuthorId(user.getId());
}
```

- depth는 최대 2까지 허용한다.
- depth를 1 이하로 유지하도록 노력한다.
  - early return, 메서드 분리 등을 적극적으로 활용한다.

## 개행

```java
// bad 
List<TodayQuizOptionDto> todayQuizOptionDtos = todayQuizOptions.stream()
                                                               .map(option -> new TodayQuizOptionDto(
                                                                               option.getId(),
                                                                               option.getWordId(),
                                                                               option.getContent(),
                                                                               option.getOptionOrder())
                                                               )
                                                               .toList();
                                                               
// good
List<TodayQuizOptionDto> todayQuizOptionDtos = todayQuizOptions.stream()
                                                               .map(
                                                                       option -> new TodayQuizOptionDto(
                                                                               option.getId(),
                                                                               option.getWordId(),
                                                                               option.getContent(),
                                                                               option.getOptionOrder()
                                                                       )
                                                               )
                                                               .toList();
```

```java
// bad
List<QuizOption> quizOptions = IntStream.range(0, splitWords.size())
                                        .mapToObj(
                                            index -> convert(splitWords.get(index), quizQuestionIds.get(index)))
                                        .flatMap(List::stream)
                                        .toList();
// good
List<QuizOption> quizOptions = IntStream.range(0, splitWords.size())
                                        .mapToObj(index ->
                                                convert(
                                                        splitWords.get(index),
                                                        quizQuestionIds.get(index)
                                        ))
                                        .flatMap(List::stream)
                                        .toList();
```

- 하나의 행에 120글자를 초과할 경우 괄호 시작 시 개행을 진행한다.
- 한 번에 여러 괄호가 중첩되서 작성될 시 각 괄호에 대한 들여쓰기를 적용한다.

```java
// bad
private ContrabandGame(TeamState teamState, int totalRounds, RoundEngine roundEngine,
GameStatus status) {
    this.teamState = teamState;
    this.totalRounds = totalRounds;
    this.roundEngine = roundEngine;
    this.status = status;
}

// good 
private ContrabandGame(
        TeamState teamState,
        int totalRounds,
        RoundEngine roundEngine,
        GameStatus status
) {
    this.teamState = teamState;
    this.totalRounds = totalRounds;
    this.roundEngine = roundEngine;
    this.status = status;
}
```

- 메서드 시그니처 작성 시 하나의 행에 120글자를 넘어간 경우 각 메서드 파라미터마다 개행한다.

```java
// bad 
command.clientSession().tell(new HandleExceptionMessage(ExceptionCode.GAME_ROOM_NOT_FOUND));

// good 
command.clientSession()
       .tell(new HandleExceptionMessage(ExceptionCode.GAME_ROOM_NOT_FOUND));
```

- 한 줄에는 하나의 `.` 만을 사용한다.

## 매직 넘버, 리터럴 가독성

```java
long a = 1L;
double b = 1.0D;
```

- 리터럴 작성 시 해당 타입에 맞는 접미사를 대문자로 붙인다.

```java
long a = 1_000L;
long b = 10_000_000L;
```

- 리터럴 작성 시 그 값이 큰 경우 `_` (언더스코어)를 통해 가독성을 확보한다.

```java
// bad
public String buildSlackMessageJson(String channel, String text) {
    return "{"
            + "\"channel\":\"" + channel + "\","
            + "\"text\":\"" + text.replace("\"", "\\\"") + "\""
            + "}";
}

// good
public String buildSlackMessageJson(String channel, String text) {
    return """
           {
             "channel": "%s",
             "text": "%s"
           }
           """.formatted(channel, escapedText);
}
```

- 복잡한 텍스트 작성 시 text block을 사용한다.
- 동적으로 텍스트를 변경해야 하는 경우 StringBuilder를 사용한다.

## 변수

```java
// bad
command.clientSession()
       .tell(new HandleExceptionMessage(ExceptionCode.LOBBY_FULL));
       
// good 
HandleExceptionMessage lobbyFullExceptionMessage = new HandleExceptionMessage(ExceptionCode.LOBBY_FULL);

command.clientSession()
       .tell(lobbyFullExceptionMessage);
```

- 파라미터로 객체를 전달하는 경우 해당 객체를 별도의 변수에 할당해 전달한다.

## wrapper type

- 제네릭과 같이 primitive type을 문법적 상황으로 인해 wrapping 해야 하는 경우를 제외하면 반드시 primitive type을 사용한다.
- JPA Entity의 ID 및 Nullable 컬럼과 같이 null을 허용해야 하는 경우를 제외하고는 Primitive Type을 사용한다.
