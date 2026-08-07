# 작업 요청서 (docs/ask.md)
왜
admin/node_modules

node_modules은 프로젝트 루트에만 있어야 하잖아 
npx pm2 delete all
npm run preinstall
npm run build --workspace=server
npm run build --workspace=admin
npm run build --workspace=basic-plugin
npm run server:start
npm run admin:start
를 운영하는데 9700포트로 하나로 통신 하는거잖아 엉뚱하게 멋대로 하지말고 
시작 빌드 스크립트들이 정상 적으로 기동 가능 하도록 점검 개선 해야 되 
