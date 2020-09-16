//필요한 모듈 가져오기
const express = require('express')
const path = require('path')

//express 객체 만들기
const app = express()
//포트 설정
app.set('port',process.env.PORT||3000)

//요청 생성
//GET방식으로 /요청이 오면 처리
//req는 요청 객체이고 res는 응답 객체
app.get('/',(req,res)=>{
    res.send('Hello Express Web Server')
})

app.get('/index',(req,res) => {
    //html 파일 출력
    //__dirname은 현재 디렉토리
    //현재 디렉토리의 index.html 파일을 전송
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/json',(req,res) => {
    //json 파일 출력
    res.json({'name':'배기훈','age':28})
})

//서버 구동
app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중')
})