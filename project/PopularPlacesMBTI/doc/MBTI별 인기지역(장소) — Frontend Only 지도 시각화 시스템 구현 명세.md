# MBTI별 인기지역(장소) — Frontend Only 지도 시각화 시스템 구현 명세

## 1. 프로젝트 목적

가칭 **“MBTI별 인기지역(장소)”** 시스템을 구현한다.

이 시스템은 특정 MBTI 유형의 사용자들이 **현재 시각을 기준으로 최근 1시간 동안 로그인한 위치**를 분석하고, 해당 위치들의 공간적 군집을 지도 위에 표시한다.

초기 버전에서는 실제 사용자 데이터나 서버를 사용하지 않는다.

대신 브라우저에서 생성한 **가상 사용자 5,000명의 MBTI, 로그인 시간, 로그인 위치 기록​**을 사용한다.

사용자가 특정 MBTI를 선택하면:

```text
전체 가상 사용자 5,000명
        ↓
선택한 MBTI 필터
        ↓
현재 시각 기준 최근 1시간 로그인 필터
        ↓
해당 사용자의 로그인 위치
        ↓
공간 Cluster 계산
        ↓
지도에 MBTI별 인기지역 표시
```

형태로 동작해야 한다.

---

# 2. 핵심 요구사항

반드시 다음 요구사항을 만족하도록 구현한다.

```text
1. 가상 사용자 수는 5,000명이다.

2. 각 사용자는 16개 MBTI 중 하나를 가진다.

3. 각 사용자는 로그인 시간과 로그인 위치를 가진다.

4. 사용자가 화면에서 MBTI 하나를 선택한다.

5. 선택된 MBTI에 해당하는 사용자 중
   현재 시각 기준 최근 1시간 안에 로그인한 사용자만 검색한다.

6. 검색된 사용자의 로그인 위치를 지도에 군집 형태로 표시한다.

7. 현재 시간이 변경되면 최근 1시간 범위도 자동으로 변경된다.

8. 새로 최근 1시간 범위에 들어오는 로그인 기록은 자동으로 추가된다.

9. 1시간보다 오래된 로그인 기록은 지도 분석 대상에서 자동으로 제외된다.

10. 지도 확대/축소 수준에 따라 Cluster의 상세도가 변경되어야 한다.

11. Backend를 사용하지 않는다.

12. Database를 사용하지 않는다.

13. 초기 버전은 Frontend Only 정적 페이지로 동작해야 한다.

14. 가능하면 단일 페이지로 동작해야 한다.

15. 모든 샘플 데이터는 브라우저에서 생성하거나 정적 JavaScript 데이터로 관리한다.
```

---

# 3. 가장 중요한 시간 조건

시스템의 분석 기준은 항상 **현재 시각 기준 최근 1시간**이다.

현재 시간이:

```text
2026-09-04 19:30
```

이라면 분석 대상 시간은:

```text
18:30 <= loginTime <= 19:30
```

이다.

즉:

```text
Current Time = T

Active Login Window

T - 60 minutes
        ~
T
```

이다.

수식으로 표현하면:

```text
active =
    loginTime >= currentTime - 1 hour
    AND
    loginTime <= currentTime
```

---

# 4. 로그인 여부가 아니라 로그인 이벤트를 기준으로 한다

초기 시스템에서는 사용자가 현재 로그인 상태인지 추적하는 복잡한 Session 모델은 만들 필요가 없다.

기준은 단순하게:

> **최근 1시간 안에 해당 사용자가 로그인한 기록이 있는가**

이다.

예:

```text
현재 시간: 19:30
```

다음 사용자들이 있다고 가정한다.

```text
User A
MBTI: INFP
로그인: 19:20
→ 포함


User B
MBTI: INFP
로그인: 18:42
→ 포함


User C
MBTI: INFP
로그인: 18:29
→ 제외


User D
MBTI: ENFP
로그인: 19:10
→ MBTI가 다르므로 제외
```

따라서 사용자가 `INFP`를 선택했다면:

```text
User A
User B
```

의 위치만 Cluster 계산에 사용한다.

---

# 5. 시간 흐름에 따른 자동 변화

현재 시간이 계속 흐르기 때문에 지도 데이터도 자동으로 변경되어야 한다.

예:

```text
19:30

분석 범위:
18:30 ~ 19:30
```

1분 후:

```text
19:31

분석 범위:
18:31 ~ 19:31
```

따라서:

```text
18:30 로그인 사용자
→ 분석 대상에서 제거

19:31 로그인 사용자
→ 분석 대상에 추가
```

되는 형태이다.

---

# 6. 시스템 데이터 흐름

전체 구조:

```text
Synthetic Users
5,000명
        │
        ▼
MBTI Filter
        │
        ▼
Current Time
        │
        ▼
Current Time - 1 Hour
        │
        ▼
Recent Login Filter
        │
        ▼
Login Locations
        │
        ▼
Spatial Clustering
        │
        ▼
Map Visualization
```

---

# 7. 시스템 기술적 제약

초기 버전에서는 Backend를 만들지 않는다.

사용하지 않는 것:

```text
Spring Boot
Node.js Backend
Express
FastAPI
Database
PostgreSQL
PostGIS
Redis
WebSocket Server
REST Server
```

모든 처리는 Browser에서 수행한다.

---

# 8. 권장 초기 기술 스택

가장 단순한 형태를 우선한다.

```text
HTML
CSS
JavaScript
CesiumJS
```

파일 구조:

```text
mbti-hotspot/
│
├── index.html
├── app.js
└── style.css
```

가능하면 초기 MVP는 이 세 파일만으로 구현한다.

---

# 9. 확장 가능한 구조

프로젝트가 커진다면 추후 다음 구조로 변경할 수 있다.

```text
React
TypeScript
Vite
CesiumJS
```

하지만 최초 구현에서 React를 반드시 도입할 필요는 없다.

최우선 목표는:

```text
Static
Frontend Only
Single Page
Simple
```

이다.

---

# 10. 지도 엔진

지도 환경은 Mini Seoul 3D와 유사한 느낌을 목표로 한다.

지도 엔진으로는 **CesiumJS를 우선 사용한다.**

목표는 실제 건물 Digital Twin을 만드는 것이 아니라:

```text
서울 지도
+
MBTI 사용자 위치
+
공간 Cluster
```

를 표현하는 것이다.

따라서 최초 버전에서는 복잡한 3D Tiles 건물 데이터가 필수는 아니다.

---

# 11. 초기 지도 형태

다음 중 하나를 사용할 수 있다.

## 권장 초기 형태

```text
Cesium Globe
+
Simple Basemap
+
Cluster Marker
```

또는:

```text
Cesium
+
단색 지도 배경
+
Cluster Marker
```

Mini Seoul 3D처럼 데이터 자체를 강조하는 표현을 권장한다.

---

# 12. 서비스 지역

초기 버전은 서울로 제한한다.

기준 중심점 예:

```text
longitude = 126.9780
latitude  = 37.5665
```

가상 사용자들의 모든 로그인 위치도 서울 영역 내부에서 생성한다.

---

# 13. MBTI 목록

16개 MBTI를 모두 지원한다.

```text
ISTJ
ISFJ
INFJ
INTJ

ISTP
ISFP
INFP
INTP

ESTP
ESFP
ENFP
ENTP

ESTJ
ESFJ
ENFJ
ENTJ
```

---

# 14. 전체 가상 사용자

총 사용자 수:

```text
5000
```

각 사용자에게 최소 다음 정보를 생성한다.

```text
userId
mbti
loginTime
longitude
latitude
```

---

# 15. 최소 데이터 모델

예:

```javascript
{
    userId: 1024,

    mbti: "INFP",

    loginTime: 1788513600000,

    longitude: 126.9237,

    latitude: 37.5563
}
```

`loginTime`은 JavaScript Unix Timestamp(milliseconds)를 사용하는 것을 권장한다.

예:

```javascript
Date.now()
```

---

# 16. 타입 개념

TypeScript를 사용할 경우:

```typescript
interface MbtiLoginRecord {
    userId: number;
    mbti: MbtiType;
    loginTime: number;
    longitude: number;
    latitude: number;
}
```

---

# 17. 로그인 데이터와 사용자의 관계

초기 MVP에서는 다음처럼 단순화한다.

```text
5000 users
=
5000 login records
```

즉 각 가상 사용자는 현재 시뮬레이션 주기에서 하나의 로그인 기록을 가진다.

추후에는:

```text
1 user
→ multiple login records
```

형태로 확장할 수 있지만 MVP에서는 불필요하다.

---

# 18. 초기 로그인 시간 생성

페이지가 처음 실행될 때 5,000명의 로그인 시간을 생성한다.

단순한 방법:

```text
현재 시간 기준
-24시간
~
현재 시간
```

범위에서 랜덤하게 생성한다.

예:

```javascript
const loginTime =
    Date.now() -
    Math.random() * 24 * 60 * 60 * 1000;
```

이렇게 하면 최근 24시간 안에서 로그인한 가상 사용자 5,000명이 만들어진다.

---

# 19. 보다 자연스러운 로그인 시간 분포

완전 Uniform Random보다 시간대에 따라 로그인 가능성을 다르게 하는 것이 좋다.

예:

```text
00 ~ 06시
낮은 로그인 확률

07 ~ 09시
중간

10 ~ 16시
중간

17 ~ 22시
높음

23 ~ 24시
중간
```

그러나 초기 기능 검증에서는 Uniform Random도 허용한다.

---

# 20. 시간 시뮬레이션의 핵심

단순히 페이지 시작 시 5,000명의 고정 로그인 기록만 만든다면 시간이 지나면서 최근 1시간 데이터가 계속 줄어드는 문제가 있다.

예:

```text
페이지 시작
19:00

1시간 경과
20:00

새로운 loginTime이 생성되지 않으면
활성 사용자 수가 계속 감소
```

따라서 시스템은 **새로운 로그인 이벤트를 지속적으로 시뮬레이션해야 한다.**

---

# 21. 가상 신규 로그인 생성

Frontend 내부에서 일정 주기로 일부 사용자의 로그인 시간을 현재 시간으로 갱신한다.

예:

```text
매 5초

랜덤 사용자 일부 선택

loginTime = 현재 시간
location = 새로운 랜덤 위치
```

이 사용자는:

```text
새로 로그인한 사용자
```

로 취급한다.

---

# 22. 권장 신규 로그인 시뮬레이션

예:

```javascript
setInterval(() => {

    const loginCount =
        randomInteger(1, 10);

    for (let i = 0; i < loginCount; i++) {

        const user =
            randomUser();

        user.loginTime =
            Date.now();

        user.location =
            generateLocation(user.mbti);
    }

}, 5000);
```

이는 실제 서버 데이터가 아니라 브라우저 내부 Simulation이다.

---

# 23. 같은 사용자의 재로그인

랜덤으로 선택된 사용자가 이미 최근 1시간 내 로그인 사용자여도 다시 로그인할 수 있다.

이 경우:

```text
old login time
→ current time
```

으로 변경한다.

예:

```text
기존

User 100
INFP
18:45


19:20에 다시 선택

→

User 100
INFP
19:20
```

최근 로그인 기록만 유지한다.

---

# 24. 위치도 새로 생성 가능

재로그인 시 위치 역시 새로운 장소로 변경해도 된다.

```text
로그인 이벤트
=
새로운 시간
+
새로운 GPS 위치
```

따라서:

```javascript
user.loginTime = Date.now();

const location =
    generateMbtiLocation(user.mbti);

user.longitude =
    location.longitude;

user.latitude =
    location.latitude;
```

형태를 권장한다.

---

# 25. 이 방식의 의미

브라우저를 실행해 놓으면:

```text
새로운 사용자가 로그인

오래된 로그인 기록이 최근 1시간 범위에서 빠짐

새로운 위치가 Cluster에 추가

Cluster 중심과 사용자 수 변경
```

이 지속적으로 발생한다.

즉 Backend가 없어도 살아 움직이는 서비스처럼 보인다.

---

# 26. 최근 1시간 필터 함수

핵심 함수 중 하나이다.

```javascript
function getRecentUsers(users, mbti, now) {

    const oneHour =
        60 * 60 * 1000;

    return users.filter(user => {

        return (
            user.mbti === mbti &&
            user.loginTime >= now - oneHour &&
            user.loginTime <= now
        );

    });
}
```

---

# 27. 분석 시간의 정의

반드시 다음 기준을 사용한다.

```text
START_TIME inclusive

currentTime - 60 minutes

END_TIME inclusive

currentTime
```

즉:

```text
[currentTime - 1 hour, currentTime]
```

범위이다.

---

# 28. 화면 갱신 주기

현재 시각과 최근 1시간 대상 데이터는 주기적으로 다시 계산한다.

권장:

```text
1초
~
5초
```

Cluster 자체는 매초 계산할 필요가 없다.

예:

```text
Clock UI
→ 1초마다

Recent Login Filter
→ 5초마다

New Login Simulation
→ 5초마다
```

형태도 가능하다.

---

# 29. 추천 Event Loop

예:

```text
Every 1 second

Current Time 갱신


Every 5 seconds

가상 신규 로그인 생성

Recent User 재계산

Cluster 재계산

Map 갱신
```

---

# 30. 시간 처리 흐름

```text
Browser Clock
      │
      ▼
Date.now()
      │
      ├──────────────┐
      │              │
      ▼              ▼
now - 1hour         now
      │              │
      └───────┬──────┘
              ▼
       Login Time Filter
              │
              ▼
       Active MBTI Users
```

---

# 31. 위치 데이터 생성 방식

서울 전체에서 완전 균등 Random을 사용하면 뚜렷한 인기지역이 생성되지 않는다.

따라서 Hotspot 기반으로 위치를 생성한다.

---

# 32. 초기 Hotspot 후보

예:

```text
홍대입구

연남동

합정

강남역

신사

성수

서울숲

이태원

잠실

건대

신촌

대학로

종로

광화문

여의도

망원

반포

한강공원
```

정확한 POI 데이터베이스가 아니라 시뮬레이션을 위한 대표 좌표를 사용한다.

---

# 33. Hotspot 데이터 모델

```javascript
const hotspots = [

    {
        id: "hongdae",
        name: "홍대",
        longitude: 126.9237,
        latitude: 37.5563,
        spread: 0.006
    },

    {
        id: "gangnam",
        name: "강남",
        longitude: 127.0276,
        latitude: 37.4979,
        spread: 0.005
    },

    {
        id: "seongsu",
        name: "성수",
        longitude: 127.0557,
        latitude: 37.5446,
        spread: 0.004
    }

];
```

---

# 34. MBTI별 Hotspot 가중치

모든 MBTI가 동일한 공간 패턴을 가지면 MBTI 선택 기능의 의미가 줄어든다.

따라서 각 MBTI마다 Hotspot 선택 가중치를 다르게 설정한다.

예:

```javascript
const mbtiPreferences = {

    INFP: {
        hongdae: 2.0,
        yeonnam: 2.2,
        seongsu: 1.5,
        hangang: 1.3,
        gangnam: 0.6
    },

    ENTJ: {
        gangnam: 2.2,
        yeouido: 2.0,
        jongno: 1.4,
        jamsil: 1.3,
        hongdae: 0.7
    }

};
```

이 값은 실제 성격 유형 통계가 아니다.

**데모 기능 검증을 위한 Synthetic Weight이다.**

---

# 35. 반드시 Synthetic Data임을 표시한다

서비스 화면에 최소 다음과 같은 안내를 표시한다.

```text
DEMO / SYNTHETIC DATA

현재 표시되는 MBTI, 로그인 위치 및 인기지역은
서비스 기능 테스트를 위해 임의 생성된 가상 데이터입니다.

실제 MBTI 유형별 행동 특성이나 지역 선호도를 의미하지 않습니다.
```

---

# 36. GPS 위치 생성

Hotspot을 하나 선택한 다음 해당 위치 주변에 Random Offset을 만든다.

권장:

```text
Weighted Hotspot Selection

        ↓

Gaussian Random Offset

        ↓

User GPS
```

---

# 37. Gaussian 형태 권장

Uniform Random:

```text
┌─────────┐
│ . . . . │
│ . . . . │
│ . . . . │
└─────────┘
```

보다 Gaussian Random:

```text
        .
      . . .
    . .●. .
      . . .
        .
```

이 군집 표현에 더 자연스럽다.

---

# 38. 사용자 생성 알고리즘

초기 사용자 5,000명 생성:

```text
for userId = 1 to 5000

    MBTI 선택

    MBTI에 따른 Hotspot 선택

    Hotspot 주변 GPS 생성

    최근 24시간 내 로그인 시간 생성

    User 객체 저장
```

---

# 39. 예제

```javascript
function createUser(id) {

    const mbti =
        randomMbti();

    const location =
        generateLocationForMbti(mbti);

    return {

        userId: id,

        mbti,

        loginTime:
            Date.now() -
            Math.random() *
            24 * 60 * 60 * 1000,

        longitude:
            location.longitude,

        latitude:
            location.latitude

    };

}
```

---

# 40. 최근 사용자 표시

사용자가:

```text
INFP
```

를 선택하고 현재 시간이:

```text
19:30
```

이라면 시스템은:

```text
INFP
+
18:30 ~ 19:30
```

조건의 사용자만 선택한다.

---

# 41. 지도에 개별 사용자 1:1 표시하지 않는 것이 기본

기본 화면에서는 5,000개의 점을 모두 보여주는 것이 아니라 Cluster로 표시한다.

예:

```text
● 4

● 11

● 36

● 82
```

숫자는 해당 Cluster 내부의 최근 로그인 사용자 수이다.

---

# 42. Cluster의 핵심 요구사항

카메라 높이 또는 Zoom Level에 따라 Cluster 범위를 변경한다.

```text
Low Altitude
→ 작은 Cluster

High Altitude
→ 큰 Cluster
```

---

# 43. 낮은 고도

예:

```text
홍대입구

     ● 11

연남동

     ● 8

합정

     ● 6

상수

     ● 4
```

---

# 44. 높은 고도

위 Cluster들이 합쳐진다.

```text
       ● 29
      마포권
```

---

# 45. 더 높은 고도

```text
서울 서북부

● 74
```

형태로 더 큰 Cluster가 될 수 있다.

---

# 46. Cluster 방법

MVP에서는 복잡한 GIS Cluster Library가 없어도 된다.

지도 Zoom/Camera Height에 따라 **Grid Size를 변경하는 방식**을 권장한다.

---

# 47. Grid Clustering

위치를 일정 크기의 Grid Cell로 나눈다.

예:

```text
┌────┬────┬────┐
│    │ ●● │    │
├────┼────┼────┤
│ ●  │ ●●●│ ●  │
├────┼────┼────┤
│    │ ●  │    │
└────┴────┴────┘
```

같은 Cell에 있는 사용자들을 하나의 Cluster로 묶는다.

---

# 48. 카메라 높이에 따른 Grid Size

예시:

```text
Camera Height < 2 km

Grid Size
≈ 100m


2 km ~ 10 km

Grid Size
≈ 300m


10 km ~ 30 km

Grid Size
≈ 1km


30 km 이상

Grid Size
≈ 3km
```

정확한 수치는 실제 UX를 보면서 조정한다.

---

# 49. 더 자연스러운 방법

고정 단계가 눈에 띈다면 Camera Height를 이용해 Grid Size를 연속적으로 계산할 수도 있다.

개념적으로:

```text
clusterRadius
=
cameraHeight × scaleFactor
```

형태이다.

---

# 50. Cluster 데이터 모델

```javascript
{
    longitude: 126.924,
    latitude: 37.556,

    count: 34,

    mbti: "INFP",

    users: [...]
}
```

실제 렌더링에서 `users` 전체를 저장하지 않고 count만 저장해도 된다.

---

# 51. Cluster 중심

Cluster 중심은 다음 중 하나를 사용한다.

## 방법 A

Grid Cell 중심

## 방법 B

포함된 사용자 GPS의 평균

권장:

```text
사용자 위치 평균
```

예:

```javascript
cluster.longitude =
    sum(longitudes) / count;

cluster.latitude =
    sum(latitudes) / count;
```

---

# 52. Cesium에서 Cluster 표현

초기에는 다음 중 하나를 사용한다.

```text
Billboard

Point Primitive

Label

Ellipse
```

권장 형태:

```text
원형 Marker
+
사용자 수 Label
```

---

# 53. Cluster 크기

사용자 수에 따라 크기를 변경한다.

예:

```text
1 ~ 5

small


6 ~ 20

medium


21 ~ 50

large


51+

very large
```

또는 연속적인 공식:

```text
radius =
baseRadius +
sqrt(count) * scale
```

을 사용할 수 있다.

---

# 54. Cluster 색상

선택한 MBTI마다 색상을 다르게 부여할 수 있다.

예:

```text
INFP
→ 특정 색상

ENTJ
→ 다른 색상
```

그러나 정확한 색상은 디자인 단계에서 결정한다.

코드 구조에서는 MBTI → Style mapping을 분리한다.

---

# 55. MBTI 선택 UI

최초 버전에서는 Dropdown으로 충분하다.

```text
MBTI

[ INFP ▼ ]
```

선택 즉시 지도 Cluster를 다시 계산한다.

---

# 56. 추천 상단 UI

```text
┌─────────────────────────────────────────────────┐
│ MBTI 인기지역                                   │
│                                                 │
│ MBTI [ INFP ▼ ]                                 │
│                                                 │
│ 현재 시각        19:32:14                       │
│ 분석 구간        18:32 ~ 19:32                  │
│ 최근 로그인      23명                           │
│ 전체 가상 사용자 5,000명                        │
└─────────────────────────────────────────────────┘
```

---

# 57. 반드시 분석 시간 범위를 표시한다

사용자가 어떤 데이터가 표시되고 있는지 이해할 수 있도록:

```text
최근 1시간

18:32 ~ 19:32
```

를 화면에 표시한다.

---

# 58. 통계

선택한 MBTI에 대해 최소 다음 값을 보여준다.

```text
선택 MBTI

최근 1시간 로그인 사용자 수

생성 Cluster 수

가장 큰 Cluster 사용자 수
```

---

# 59. 선택적으로 보여줄 수 있는 값

```text
가장 인기 있는 지역

최근 5분 신규 로그인

최근 10분 증가량

Cluster 평균 크기
```

MVP 이후 추가한다.

---

# 60. Cluster 클릭

Cluster Marker를 클릭하면 간단한 Popup을 표시한다.

예:

```text
INFP

최근 1시간 로그인
34명

대표 위치
홍대 인근

최근 10분
+7명
```

초기 버전에서는 지역명을 정확하게 Reverse Geocoding하지 않아도 된다.

Hotspot 이름이 가까운 경우 이를 표시할 수 있다.

---

# 61. 대표 지역명 결정

각 Cluster 중심과 가장 가까운 Hotspot을 찾는다.

예:

```text
Cluster

126.925
37.557

↓

Nearest Hotspot

홍대
```

그 후:

```text
홍대 인근
```

이라고 표시한다.

---

# 62. 시간과 Cluster의 관계

중요한 점은 Cluster가 고정된 것이 아니라는 것이다.

예:

```text
19:30

홍대
● 34
```

시간이 지나면서:

```text
19:35

일부 사용자는
1시간 범위 밖으로 빠짐

새로운 사용자는
로그인

결과:

홍대
● 39
```

처럼 자연스럽게 변화한다.

---

# 63. 데이터 변화 시 지도 업데이트

매번 Cesium Entity 전체를 삭제하고 다시 생성하는 방식도 MVP에서는 가능하다.

하지만 가능하면:

```text
Cluster ID
```

를 만들어 기존 객체를 갱신하는 구조가 좋다.

초기 데이터가 5,000명 수준이므로 단순 재생성 방식도 충분히 테스트 가능하다.

---

# 64. Cluster ID

예:

```text
gridX_gridY_mbti
```

형태를 사용할 수 있다.

예:

```text
12702_3755_INFP
```

---

# 65. Frontend 상태

최소 상태:

```javascript
const state = {

    users: [],

    selectedMbti: "INFP",

    currentTime: Date.now(),

    recentUsers: [],

    clusters: []

};
```

---

# 66. 전체 Runtime 흐름

페이지 로딩:

```text
index.html

   ↓

Cesium 초기화

   ↓

Hotspot 초기화

   ↓

5000명의 Synthetic User 생성

   ↓

기본 MBTI 선택

   ↓

최근 1시간 사용자 검색

   ↓

Cluster 계산

   ↓

지도 표시

   ↓

Simulation Timer 시작
```

---

# 67. Timer 동작

```text
Timer

Every 1 second

    Current Time Update

Every 5 seconds

    Generate New Logins

    Recent User Filter

    Cluster Calculation

    Update Map
```

---

# 68. pseudo code

```javascript
function update() {

    const now =
        Date.now();

    state.currentTime =
        now;

    simulateNewLogins(now);

    state.recentUsers =
        getRecentUsers(
            state.users,
            state.selectedMbti,
            now
        );

    const gridSize =
        getGridSizeFromCameraHeight();

    state.clusters =
        clusterUsers(
            state.recentUsers,
            gridSize
        );

    renderClusters(
        state.clusters
    );

    updateStatistics();

}
```

---

# 69. MBTI 변경

사용자가 MBTI를 변경하면 Timer를 기다리지 말고 즉시 재계산한다.

```javascript
function onMbtiChange(mbti) {

    state.selectedMbti =
        mbti;

    refreshMap();

}
```

---

# 70. Camera 이동

지도 확대/축소 시에도 Cluster를 다시 계산해야 한다.

```text
Camera changed

        ↓

Camera Height

        ↓

Cluster Grid Size 변경

        ↓

Cluster 재계산
```

---

# 71. 너무 자주 재계산하지 않도록 한다

Cesium Camera가 움직이는 동안 이벤트가 매우 많이 발생할 수 있다.

따라서:

```text
debounce
```

를 사용한다.

예:

```text
Camera Change

300ms 동안 추가 변경 없음

→ Cluster Refresh
```

---

# 72. 성능 목표

사용자:

```text
5000
```

정도는 Browser JavaScript에서도 충분히 처리 가능한 수준이다.

필터:

```text
O(N)
```

Cluster:

```text
O(N)
```

Grid Hashing을 사용하면 전체 계산도 비교적 단순하다.

---

# 73. Grid Hashing 예

개념:

```javascript
const key =
    `${gridX}_${gridY}`;
```

Map 사용:

```javascript
const clusters =
    new Map();
```

각 사용자를 해당 Cell에 넣는다.

---

# 74. 복잡한 DBSCAN은 MVP에 필요 없음

다음 알고리즘도 가능하지만 초기 구현에는 과하다.

```text
DBSCAN

HDBSCAN

K-Means
```

MVP에서는:

```text
Dynamic Grid Clustering
```

을 우선한다.

이유:

```text
Zoom Level에 따른 Cluster 크기 변경이 쉬움

구현 단순

빠름

Frontend Only에 적합
```

---

# 75. 추후 Supercluster 도입

향후 일반적인 2D 지도 라이브러리를 사용하거나 데이터가 늘어난다면:

```text
Supercluster
```

같은 라이브러리를 고려할 수 있다.

하지만 MVP에서는 의존성을 최소화한다.

---

# 76. 데이터 보관

Backend가 없으므로 페이지 Reload 시 데이터가 재생성되어도 된다.

즉:

```text
Reload

→ 새로운 5,000명

→ 새로운 로그인 시간

→ 새로운 GPS
```

MVP에서는 정상 동작이다.

---

# 77. 동일 데이터 재현 옵션

디버깅을 위해 Seeded Random을 사용할 수도 있다.

예:

```text
seed = 20260904
```

그러면 Reload해도 같은 초기 사용자 데이터를 생성할 수 있다.

개발 단계에서는 이 기능을 권장한다.

---

# 78. LocalStorage 사용 여부

선택 사항이다.

다음 경우 사용할 수 있다.

```text
선택 MBTI 저장

Camera 위치 저장

Simulation Seed 저장
```

그러나 초기 사용자 데이터 전체를 LocalStorage에 저장할 필요는 없다.

---

# 79. Privacy

모든 위치는 Synthetic Data이므로 실제 개인정보는 존재하지 않는다.

그래도 코드와 화면에:

```text
Fake User
Synthetic GPS
Demo Login Record
```

라는 의미를 명확히 한다.

향후 실제 위치 데이터로 확장할 경우 별도의 Privacy 설계가 필요하다.

---

# 80. 권장 화면 레이아웃

```text
┌────────────────────────────────────────────────────┐
│ MBTI 인기지역                                      │
│                                                    │
│ [INFP ▼]                                           │
│ 최근 1시간 18:32 ~ 19:32                           │
│ 활성 로그인 27명                                   │
│                                                    │
├────────────────────────────────────────────────────┤
│                                                    │
│                     ● 9                            │
│                                                    │
│          ● 4                                       │
│                                                    │
│                              ● 14                  │
│                                                    │
│                SEOUL MAP                           │
│                                                    │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

# 81. 높은 고도 화면

```text
서울

        ● 28

                  ● 43


    ● 19
```

권역 수준 Cluster를 표시한다.

---

# 82. 낮은 고도 화면

```text
홍대 인근

       ● 4


  ● 7


              ● 3


        ● 11
```

더 작은 공간 단위로 나뉜다.

---

# 83. Cluster 애니메이션

Cluster 수가 변경될 때 갑자기 크기가 변하는 것보다:

```text
Scale interpolation
```

등의 간단한 Transition을 적용할 수 있다.

MVP 필수 기능은 아니다.

---

# 84. 데이터 생성과 Rendering을 분리한다

코드를 다음 영역으로 분리한다.

```text
Synthetic Data

Time Filter

Spatial Cluster

Cesium Rendering

UI
```

예:

```javascript
generateUsers()

simulateLogin()

getRecentUsers()

clusterUsers()

renderClusters()

updateUi()
```

---

# 85. app.js 권장 구조

```text
app.js


CONFIG


HOTSPOTS


MBTI CONFIG


Synthetic Data Functions


Time Functions


Cluster Functions


Cesium Functions


UI Functions


Simulation Functions


Initialization
```

---

# 86. Config

가능하면 주요 수치를 코드 곳곳에 직접 넣지 않는다.

```javascript
const CONFIG = {

    USER_COUNT: 5000,

    ACTIVE_WINDOW_MS:
        60 * 60 * 1000,

    LOGIN_SIMULATION_INTERVAL_MS:
        5000,

    UI_CLOCK_INTERVAL_MS:
        1000,

    DEFAULT_MBTI:
        "INFP"

};
```

---

# 87. Simulation 속도도 Config화

개발 중 빠르게 테스트할 수 있도록:

```javascript
SIMULATION_SPEED
```

개념을 추가할 수 있다.

예:

```text
1x
10x
60x
```

하지만 Production Demo 기본값은 실제 시간:

```text
1x
```

로 한다.

---

# 88. 개발용 시간 제어

디버깅을 위해 선택적으로 다음 기능을 제공할 수 있다.

```text
Real Time

Pause

+10 min

+1 hour
```

이 기능은 개발 모드에서만 표시해도 된다.

---

# 89. 가장 중요한 검증 시나리오

## 테스트 1

현재 시간:

```text
19:00
```

사용자:

```text
INFP
18:01
```

결과:

```text
포함
```

---

# 90. 경계 테스트

현재 시간:

```text
19:00
```

로그인:

```text
18:00
```

정책:

```text
포함
```

즉 정확히 60분 전도 포함한다.

---

# 91. 제외 테스트

현재:

```text
19:00
```

로그인:

```text
17:59:59
```

결과:

```text
제외
```

---

# 92. MBTI 테스트

선택:

```text
INFP
```

사용자:

```text
ENFP
18:30
```

결과:

```text
제외
```

---

# 93. 신규 로그인 테스트

사용자:

```text
INFP
17:00
```

현재:

```text
19:00
```

처음에는 제외된다.

Simulation에서 재로그인:

```text
19:00:05
```

즉시:

```text
포함
```

되어야 한다.

---

# 94. 만료 테스트

사용자 로그인:

```text
18:00
```

현재:

```text
18:59:59
```

포함.

현재:

```text
19:00
```

경계 정책에 따라 포함.

현재:

```text
19:00:01
```

제외.

---

# 95. Zoom Cluster 테스트

같은 사용자 위치 집합을 가지고:

```text
Low Camera

Cluster Count
높음


High Camera

Cluster Count
낮음
```

이어야 한다.

즉:

```text
Zoom Out
→ cluster merge

Zoom In
→ cluster split
```

이 반드시 확인되어야 한다.

---

# 96. 초기 구현 순서

Coding Agent는 다음 순서로 구현한다.

```text
1. index.html 생성

2. style.css 생성

3. CesiumJS 지도 초기화

4. 서울 중심 카메라 설정

5. MBTI Dropdown 생성

6. Hotspot 데이터 생성

7. MBTI별 Hotspot Weight 생성

8. 가상 사용자 5,000명 생성

9. 로그인 시간을 최근 24시간 범위로 생성

10. 최근 1시간 Filter 구현

11. 현재 선택 MBTI Filter 구현

12. Grid Clustering 구현

13. Cluster Marker 렌더링

14. Camera Height 기반 Grid Size 구현

15. 신규 로그인 Simulation 구현

16. 1시간 지난 사용자 자동 제외 구현

17. 현재 시각 UI 구현

18. 최근 1시간 구간 UI 구현

19. 활성 사용자 수 UI 구현

20. Cluster 클릭 Popup 구현

21. Camera Debounce 구현

22. 성능 테스트
```

---

# 97. MVP 완료 조건

다음 항목이 모두 작동해야 한다.

```text
[ ] 정적 페이지로 실행된다.

[ ] Backend 없이 동작한다.

[ ] 서울 지도가 표시된다.

[ ] 5,000명의 가상 사용자가 생성된다.

[ ] 모든 사용자에게 MBTI가 존재한다.

[ ] 모든 사용자에게 loginTime이 존재한다.

[ ] 모든 사용자에게 GPS 위치가 존재한다.

[ ] 사용자가 MBTI를 선택할 수 있다.

[ ] 선택한 MBTI만 분석된다.

[ ] 현재 시각 기준 최근 1시간 사용자만 분석된다.

[ ] 1시간이 지난 사용자가 자동으로 제외된다.

[ ] 새로운 로그인 사용자가 자동으로 생성된다.

[ ] 새 로그인 사용자가 지도에 반영된다.

[ ] 로그인 위치가 Cluster로 표시된다.

[ ] Cluster에 사용자 수가 표시된다.

[ ] Zoom In 시 Cluster가 세분화된다.

[ ] Zoom Out 시 Cluster가 합쳐진다.

[ ] 현재 시간이 표시된다.

[ ] 분석 시간 범위가 표시된다.

[ ] 최근 1시간 로그인 사용자 수가 표시된다.

[ ] Synthetic Data임을 화면에 명시한다.
```

---

# 98. 초기 시스템 최종 구조

```text
┌─────────────────────────────────────────────┐
│                  Browser                    │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ Synthetic User Generator              │  │
│  │                                       │  │
│  │ 5,000 users                           │  │
│  │ MBTI                                  │  │
│  │ Login Time                            │  │
│  │ GPS                                   │  │
│  └──────────────────┬────────────────────┘  │
│                     │                       │
│                     ▼                       │
│  ┌───────────────────────────────────────┐  │
│  │ Login Simulator                       │  │
│  │                                       │  │
│  │ Random Users                          │  │
│  │ → New Login Time                      │  │
│  │ → New GPS                             │  │
│  └──────────────────┬────────────────────┘  │
│                     │                       │
│                     ▼                       │
│  ┌───────────────────────────────────────┐  │
│  │ Filter                                │  │
│  │                                       │  │
│  │ Selected MBTI                         │  │
│  │ AND                                   │  │
│  │ Now - 1 Hour <= Login <= Now          │  │
│  └──────────────────┬────────────────────┘  │
│                     │                       │
│                     ▼                       │
│  ┌───────────────────────────────────────┐  │
│  │ Dynamic Spatial Clustering            │  │
│  │                                       │  │
│  │ Camera Low  → Fine Cluster            │  │
│  │ Camera High → Large Cluster           │  │
│  └──────────────────┬────────────────────┘  │
│                     │                       │
│                     ▼                       │
│  ┌───────────────────────────────────────┐  │
│  │ CesiumJS                              │  │
│  │                                       │  │
│  │ Seoul Map                             │  │
│  │ Cluster Marker                        │  │
│  │ Count                                 │  │
│  └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 99. 시스템 핵심 공식

시스템의 핵심 데이터 선택 조건은 다음 하나로 요약된다.

```javascript
visibleUsers =
    allUsers.filter(user =>

        user.mbti === selectedMbti

        &&

        user.loginTime >=
            currentTime - 60 * 60 * 1000

        &&

        user.loginTime <=
            currentTime

    );
```

그 후:

```text
visibleUsers

        ↓

Dynamic Grid Clustering

        ↓

Cesium Cluster Rendering
```

을 수행한다.

---

# 100. 핵심 개념 요약

이 서비스에서 **“현재 특정 MBTI가 많이 모여 있는 장소”​**란:

> 현재 선택한 MBTI 유형을 가진 가상 사용자 중 현재 시각을 기준으로 최근 1시간 이내에 로그인한 사용자들의 로그인 GPS 위치가 공간적으로 많이 밀집한 지역

으로 정의한다.

즉 단순히 전체 사용자 위치를 보여주는 시스템이 아니다.

항상:

```text
MBTI

+

Recent Login Time

+

GPS Location

+

Spatial Density

+

Map Zoom
```

다섯 요소가 함께 작동해야 한다.

---

# 101. Coding Agent 최종 지시사항

이 문서를 기반으로 구현할 LLM 또는 Coding Agent는 다음 원칙을 반드시 준수한다.

1. 첫 버전은 Frontend Only로 구현한다.

2. 서버 및 DB를 추가하지 않는다.

3. 가능하면 `index.html + app.js + style.css` 정도의 최소 정적 구조로 시작한다.

4. 가상 사용자 수는 정확히 5,000명을 기본값으로 한다.

5. 사용자마다 MBTI, 마지막 로그인 시간, GPS 위치가 존재해야 한다.

6. 초기 로그인 시간은 현재 시각을 기준으로 과거 일정 범위에서 생성한다.

7. 페이지 실행 후에도 가상의 새로운 로그인 이벤트를 지속적으로 발생시킨다.

8. 신규 로그인 이벤트가 발생하면 해당 사용자의 `loginTime`을 현재 시간으로 갱신한다.

9. 필요하면 재로그인 사용자의 GPS 위치도 새로 생성한다.

10. 사용자가 MBTI를 선택하면 해당 MBTI 사용자만 분석한다.

11. 반드시 현재 시각 기준 최근 1시간 로그인 데이터만 분석한다.

12. `currentTime - 1 hour <= loginTime <= currentTime` 조건을 사용한다.

13. 시간이 흐르면서 1시간 범위를 벗어난 사용자는 자동으로 제외한다.

14. 최근 1시간 범위에 새로 들어온 사용자는 자동으로 포함한다.

15. 사용자 위치를 개별 점 중심으로 보여주는 것이 아니라 Cluster 중심으로 표현한다.

16. 낮은 카메라 고도에서는 작은 Cluster 단위를 사용한다.

17. 높은 카메라 고도에서는 인접한 Cluster가 더 큰 Cluster로 합쳐지도록 한다.

18. MVP의 Spatial Clustering은 Dynamic Grid 방식으로 구현한다.

19. Camera Height에 따라 Grid Size를 변경한다.

20. Camera 변경 이벤트에는 debounce를 적용한다.

21. 현재 시각과 최근 1시간 분석 범위를 화면에 표시한다.

22. 최근 1시간 활성 로그인 사용자 수를 표시한다.

23. Cluster Marker에는 최소한 사용자 수를 표시한다.

24. MBTI별 위치 선호도는 실제 통계가 아니라 Synthetic Weight를 사용한다.

25. 화면에 데이터가 실제 MBTI 통계가 아닌 가상 데이터임을 명확히 표시한다.

26. 데이터 생성, 시간 필터, Cluster 계산, 지도 Rendering, UI 코드를 서로 분리한다.

27. 이후 Backend/PostGIS/실제 GPS 데이터로 변경할 수 있도록 데이터 입력 부분은 독립적인 모듈 형태로 설계한다.

28. 초기 구현에서 과도한 프레임워크나 복잡한 아키텍처를 도입하지 않는다.

29. 먼저 기능이 완전히 동작하는 단일 페이지 MVP를 만든 후 구조 개선을 수행한다.

30. 구현의 최우선 검증 대상은 다음 흐름이다.

```text
5000 Synthetic Users

        ↓

Select MBTI

        ↓

Current Time - 1 Hour
        ~
Current Time

        ↓

Recent Login Users

        ↓

GPS Locations

        ↓

Zoom-dependent Spatial Clustering

        ↓

Cesium Map Visualization
```

이 흐름이 정상 작동하는 것을 초기 시스템의 완료 기준으로 한다.