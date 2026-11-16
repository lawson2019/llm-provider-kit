# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · **한국어** · [Español](README.es.md) · [Français](README.fr.md)

LLM 프로바이더와 에이전트 런타임을 위한 메타데이터 레지스트리로, 순수 JSON으로 제공되며 런타임 의존성이 없고 MIT 라이선스입니다. AI 앱, 에이전트 패널 또는 게이트웨이에 프로바이더 설정 화면을 추가하려는 모든 사용자를 대상으로 합니다. **프로바이더 108개 / 에이전트 7개**를 수록하며, 엔드포인트, 인증 방식, 폼 필드, 할당량 메모, 해당하는 경우의 위험 플래그를 포함합니다.

## Demo

라이브 데모(English / 中文): <https://lawson2019.github.io/llm-provider-kit/>

![프로바이더 구성 UI](docs/preview.png)

## 에이전트에게 전달할 프롬프트

아래 프롬프트를 임의의 코딩 에이전트에 붙여넣으면 프로젝트에 맞는 프로바이더 설정 UI를 생성합니다. 저장소를 클론할 필요는 없습니다.

```text
내 프로젝트에 LLM 프로바이더 설정 UI를 추가하세요. 저장소를 클론하지 마세요.

1. 먼저 다음 두 개의 공개 리소스를 읽으세요:
   - Skill 가이드: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - 프로바이더 레지스트리: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. 프로젝트 기술 스택(React, Vue, Svelte, 바닐라 JS, 정적 HTML)을 판단해 그에 맞는 프로바이더 설정 화면을 생성하세요.

3. 화면에 다음을 포함하세요:
   - 프로바이더를 검색하고 전환할 수 있는 선택기.
   - 저장되거나 전송되지 않는 Key / 시크릿 입력란.
   - 프로바이더별 엔드포인트 선택(요금제, 리전, 프로토콜).
   - 레지스트리에서 도출한 인증 헤더.
   - 시크릿을 마스킹한 요청 미리보기.
   - ?provider= / ?agent= 파라미터를 사용한 딥링크.

4. 각 프로바이더가 정의한 필드만 렌더링하고 프로바이더, 엔드포인트, 티어, 상태 라벨을 임의로 만들지 마세요.
```

## 생성되는 것

생성된 UI는 다섯 가지 스택——**React · Vue · Svelte · 바닐라 JS · 정적 HTML**——을 지원하며 다음을 포함합니다:

- **프로바이더 전환**: 전체 레지스트리를 검색할 수 있는 선택기를 제공합니다.
- **티어**: Starter(12), Mainstream(37), Full(전체 108)로 구성됩니다.
- **인증 헤더**: 레지스트리의 인증 방식에 따라 자격 증명을 첨부합니다.
- **요청 미리보기**: 조립된 URL과 헤더를 보여주며 시크릿은 마스킹합니다.
- **딥링크**: `?provider=` / `?agent=` 로 특정 프로바이더나 에이전트를 엽니다.

## 링크

- [GitHub 저장소](https://github.com/lawson2019/llm-provider-kit)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill 디렉터리](skills/llm-provider-kit)
- [설치 및 사용](docs/install.md)
- [기여 안내](docs/contributing.md)
- [라이선스](LICENSE)

## 라이선스

MIT. 브랜드 이름과 로고는 각 소유자에게 귀속됩니다.
