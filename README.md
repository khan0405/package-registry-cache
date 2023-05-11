# CI/CD 설치용 로컬 repository cache set

## Alpine APK repository proxy

- APK 프록시로서 로컬에 APK 파일을 캐시한다.

## Docker registry

- Docker registry 캐시

## NPM Registry - Verdaccio

- NPM Private registry. npmjs의 프록시 서버로 활용가능.
- npm token을 추가하여 auth 설정 가능

## 사용법

```bash
$ sudo docker-compose build
$ sudo docker-compose up -d
```
