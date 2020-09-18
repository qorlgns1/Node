//필요한 모듈 가져오기
const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const mysql = require('mysql');
const path = require('path');


const app = express();
app.set('port', process.env.PORT || 8000);

app.use(morgan('dev'));

//시작 페이지 설정
app.get('/', (req,res,next)=>{
	res.send('ITEM 메인 페이지 - 테스트 용')
	next()
})

//item/list 요청 처리
app.get("/item/list", (req, res, next)=>{
	//데이터베이스 접속 
	var connection = mysql.createConnection({
		host:'localhost',
		port:3306,
		user:'root',
		password:'12345678',
		database:'mysql'
	});
	//접속안되는 경우 
	connection.connect(function(err){
		if(err){
			console.log(err);
			throw err;
		}
	});
	
	//전체 데이터를 가져오는 sql 실행
	var list;
	connection.query('select * from item', function(err, results, fields){
		if(err){
			throw err;
		}
		list = results;
		//console.log(list);
		//console.log(fields);
	});
	
	//데이터 개수를 가져오는 sql 실행
	var count;
	connection.query('select count(*) cnt from item', function(err, results,fields){
		if(err){
			throw err;
		}
		count = results[0].cnt;
		//결과를 json으로 리턴
		res.json({'count':count, 'list':list});
	});
	//연결 종료
	connection.end();
});

//item/detail 요청을 get 방식으로 처리 - 파라미터는 itemid
app.get("/item/detail", (req,res,next)=>{
	//데이터베이스 접속 
	var connection = mysql.createConnection({
		host:'localhost',
		port:3306,
		user:'root',
		password:'12345678',
		database:'mysql'
	});
	//접속안되는 경우 
	connection.connect(function(err){
		if(err){
			console.log(err);
			throw err;
		}
	});
	
	//get 방식의 파라미터 읽기
	const itemid = req.query.itemid
	//상세보기 SQL 실행
	connection.query('select * from item where itemid=?', itemid, function(err, results, fields){
		if(err){
			throw err
		}
		//검색된 데이터가 없으면
		if(results.length == 0){
			res.json({'result':false})
		}else{
			res.json({'result':true ,'item':results[0]})
		}

	})
	connection.end();
})

//파일을 읽고 쓰기 위한 모듈
const fs = require('fs')
//item/date 요청 처리
app.get("/item/date", (req,res,next)=>{
	fs.readFile('./update.txt', function(err,data){
		res.json({'result':data.toString()})
	})
})

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

//item/delete(get) 요청을 처리
app.get('/item/delete', (req,res,next)=>{
	//html 파일 출력
    //__dirname은 현재 디렉토리
    //현재 디렉토리의 index.html 파일을 전송
    res.sendFile(path.join(__dirname, '/delete.html'))
})


//item/delete post
app.post("/item/delete", (req, res, next) => {
	//데이터베이스 접속 
	var connection = mysql.createConnection({
		host:'localhost',
		port:3306,
		user:'root',
		password:'12345678',
		database:'mysql'
	});
	//접속안되는 경우 
	connection.connect(function(err){
		if(err){
			console.log(err);
			throw err;
		}
	});

	const itemid = req.body.itemid;
	console.log(itemid)
	connection.query('delete FROM item where itemid = ?', itemid, function(err, results, fields) {
    	if (err)
    		throw err;
    	console.log(results)
    	if(results.affectedRows == 1){
			res.json({'result':true}); 
			const writeStream = fs.createWriteStream('./update.txt');
    		writeStream.write(Date.now().toString());
    		writeStream.end();
    	}else{
    		res.json({'result':false}); 
    	}
    	
	});
	connection.end();
})

//파일 업로드를 위한 설정
try {
	fs.readdirSync('img');
  } catch (error) {
	console.error('img 폴더가 없어 uploads 폴더를 생성합니다.');
	fs.mkdirSync('img');
  }
  
  const upload = multer({
	storage: multer.diskStorage({
	  destination(req, file, done) {
		done(null, 'img/');
	  },
	  filename(req, file, done) {
		const ext = path.extname(file.originalname);
		done(null, path.basename(file.originalname, ext) + Date.now() + ext);
	  },
	}),
	limits: { fileSize: 10 * 1024 * 1024 },
  });

//item/insert(get) 요청을 처리
app.get('/item/insert', (req,res,next)=>{
	//html 파일 출력
    //__dirname은 현재 디렉토리
    //현재 디렉토리의 index.html 파일을 전송
    res.sendFile(path.join(__dirname, '/insert.html'))
})

//item/insert(post) 요청을 처리
app.post('/item/insert', upload.single('pictureurl'), (req, res, next) => {
	//데이터베이스 접속 
	var connection = mysql.createConnection({
		host:'localhost',
		port:3306,
		user:'root',
		password:'12345678',
		database:'mysql'
	});
	//접속안되는 경우 
	connection.connect(function(err){
		if(err){
			console.log(err);
			throw err;
		}
	});

	const itemname = req.body.itemname;
	const description = req.body.description;
	const price = req.body.price;
	//업로드된 파일이름 가져오기
	var pictureurl;
	console.log(req.file.filename)
	if(req.file){
	 pictureurl = req.file.filename
	}else{
	 pictureurl = "default.jpg";
	}	
	
	connection.query('select max(itemid) maxid from item', function(err, results, fields) {
    	if (err){
			throw err;
		}
		var itemid;
    	if(results.length > 0){
			itemid = results[0].maxid + 1	
		}else{
			itemid = 1
		}
        	
    connection.query('insert into item(itemid, itemname, price, description, pictureurl) values(?,?,?,?,?)', 
    			[itemid, itemname, price,description, pictureurl], function(err, results, fields) {
    	if (err){
			throw err;
		}
    	//console.log(results)
    	if(results.affectedRows == 1){
			res.json({'result':true});
			const writeStream = fs.createWriteStream('./update.txt');
			writeStream.write(Date.now().toString());
       		writeStream.end();
    	}else{
    		res.json({'result':false}); 
    	}
    	
       	
    	});
	});
	

 })

//파일 다운로드
var util = require('util')
var mime = require('mime')

app.get('/img/:fileid', function(req, res){
		var fileId = req.params.fileid;
		var file = '/Users/marco/Desktop/eclipseworkspace/node/NodeDatabase/img' + '/' + fileId;
		console.log("file:" + file);
		mimetype = mime.lookup(fileId);
		console.log("file:" + mimetype);
		res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
		res.setHeader('Content-type', mimetype);
		var filestream = fs.createReadStream(file);
		filestream.pipe(res);
});


//에러 페이지 설정
app.use((err, req, res, next) => {
  	console.log(err)
	res.send(err.message)
});

app.listen(app.get('port'), () => {
  	console.log(app.get('port'), '번 포트에서 대기 중');
	console.log('ITEM Server 정상 동작 중')
});
