## 요구조건

1. 사용자는 일반 사용자 또는 사업자 사용자로 회원가입 및 로그인 할 수 있다.
   1. 일반 사용자 → `User`
   2. 사업자 사용자 → `Partner`
2. `Partner`는 복수의 `Accommodation`을 CRUD 할 수 있다.
3. `Accommodation`은 복수의 `Room`을 가진다
4. `Room`은 복수의 `Reservation`을 가진다.
   1. `Room`은 하나의 날짜에 대해서는 하나의 `Reservation` 만을 가진다.
   2. `Reservation`은 연박을 고려하지 않는다.
   3. `Reservation`은 대실 등의 경우를 고려하지 않고 숙박의 경우만을 다룬다.
5. `User`는 복수의 `Reservation`을 가질 수 있다.
6. `Reservation`은 2024년 3월 31일까지만 가능하다.
7. 로그인 하지 않은 사용자도 다음의 조건들을 사용하여 예약 가능한 숙소 목록을 볼 수 있다.
   1. 날짜
   2. `Region`
   3. `AccommodationType`
8. `Partner`는 `isReserved` 상태의 `Reservation`은 `checkedInAt`을 할당할 수 있다.
9. `checkedInAt` 이 할당 된 `Reservation`에 대해 `User`는 `Review`를 생성할 수 있다.
10. `isReserved` 상태의 `Reservation`은 일반 고객과 사업자 고객 양쪽 모두에 의해 취소 될 수 있다.

---

## Modeling

### User

- `id` : number
- `email` : string
- `encryptedPassword` : string
- `profile` : UserProfile
  - `nickname` : string
  - `phoneNumber` : string

### Partner

- `id` : number
- `email` : string
- `encryptedPassword` : string
- `name` : string
- `phoneNumber` : string
- `accommodations` : Accommodation[]

### Accommodation

- `partner` : Partner - 숙소 제공
- `name` : string - 숙소명
- `rooms`: Room[] - 룸
- `regions` : Regions - 숙소가 속하는 지역들
- `address1` : string - 숙소의 주소
- `address2` : string - 숙소의 상세 주소
- `latitude` : number - 위도
- `longitude` : number - 경도
- `imgUrl` : string - 대표 이미지의 주소
- `type` : AccomdationType
  - AccommodationType
    - hotel
    - motel
    - resort
    - pension
    - guestHouse
    - poolVilla
    - camping
    - glamping
- `description` : string - 한 줄 소개
- `reviews` : Review[] - 리뷰들
- `~~amemities` : Amenity[] - 서비스 및 부대시설~~

### Room

- `accommodation` : Accommodation
- `name` : string - 이름
- `originalPrice` : number - 정가
- `price` : number - 판매가
- `checkInTime` : string - 입실 시간
- `checkOutTime` : string - 퇴실 시간
- `description` : string - 객실 한줄 소개
- `reservations` : Reservations[] - 예약들

### Region

- `id` : number
- `name` : string
- `accommodations` : Accommodation[]

### Reservation

- `id` : number
- `date` : Date
- `isReserved` : boolean - 예약 여부
- `reservedBy` : User?
- `room` : Room
- `isCheckedIn` : boolean - 체크인 여부

### Review

- `id` : number
- `room` : Room
- `user` : User
- `createdAt` : Date
- `rating` : number
- `content`: string?

### ~~Bookmark~~

### ~~Amenity~~

---
