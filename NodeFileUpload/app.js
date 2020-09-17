//모듈 가져오기 - express, morgan, cookie-parser, express-session
//dotenv, multer
//path, fs 는 기본 내장 모듈

//express 모듈은 웹 서버를 편리하게 만들어주는 모듈 
const express = require('express')
//multer는 파일 업로드 처리를 위한 모듈
const multer = require('multer')
//fs는 파일 읽고 쓰기 위한 내장 모듈
const fs = require('fs');
//path는 파일 경로와 관련된 내장 모듈 - express 에서는 필수
const path = require('path')


//morgan는 로그를 자세히 출력하기 위한 모듈
const morgan = require('morgan')
//cookie-parser 와 session은 쿠키와 세션을 사용하기 위한 모듈
const cookieParser = require('cookie-parser')
const session = require('express-session')
//dotenv는 .env 파일에 작성한 내용을 process.env.으로 호출할 수 있도록 해주는 모듈
const dotenv = require('dotenv')


//.env 파일의 내용 가져오기
dotenv.config()

//웹 서버 객체를 만들고 포트를 설정
const app = express();
app.set('port', process.env.PORT || 4000)

//자세한 로그를 출력
app.use(morgan('dev'))
//정적 자원의 경로 설정 - stylesheet, js, 이미지 파일의 경로를 설정
//정적자원들은 /로 시작하면 public 디렉토리에서 찾아옴 
app.use('/', express.static(path.join(__dirname, 'public')))

//post    방식의 파라미터를 req.body로 읽을 수 있도록 해주는 설정
app.use(express.json())
app.use(express.urlencoded({extended:false}))

//쿠기와 세션을 사용할 수 있도록 해주는 설정
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(session({
   resave:false,
   saveUninitialzed:false,
   secret:process.env.COOKIE_SECRET,
   cookie:{
      httpOnly:true,
      secure:false,
   },
   name:'session-cookie'
}))

//파일 업로드 처리
try{
   fs.readdirSync('uploads')//디렉토리가 있는 경우 연결
}catch(error){
   console.error('디렉토리가 없어서 생성')
   fs.mkdirSync('uploads')//디렉토리가 없어서 연결이 안되면 생성하고 연결
}

const upload = multer({
   storage:multer.diskStorage({
      destination(req, file, done){
         done(null, 'uploads/')
      },
      fulename(req, file, done){
         //업로드 되는 파일의 원래 이름에서 확장자 추출
         const ext = path.extname(file.originalname);
         //원래 파일 이름에 현재시간을 더해서 파일 이름을 생성 - 중복된 이름 방지
         done(null, path.basename(file.originalname, ext)+Data.now() + ext);
      },
   }),
   limits:{filesize:1024 * 1024 * 10},
})

//요청 처리
app.get('/', (req, res, next) => {
   res.send('안녕하세요 메인 페이지 입니다.');
   //미들웨어의 내용을 수행
   next();
});

//upload 요청이 get 방식으로 전송되면 multipart.html 파일을 출력
app.get('/upload', (req, res) => {
   res.sendFile(path.join(__dirname, 'multipart.html'))
});

//upload 요청이 post 방식으로 전송되면 처리
app.post('/upload', upload.array('image'), (req, res) => {
   //전송된 파일에 대한 정보
   //console.log(req.file)   //file이 undefined이면 전송된 파일이 없는 것임
   console.log(req.files);   //여러 개의 파일이 선택 가능할 때 사용
   //다른 파라미터 확인
   console.log(req.body.title);
   //결과 전송
   res.json({'result':'success'}) 
});

//서버 실행
app.listen(app.get('port'), () => {
   console.log(app.get('port'), '번 포트에서 대기 중');
});