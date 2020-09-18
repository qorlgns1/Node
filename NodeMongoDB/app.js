const express = require('express');
const morgan = require('morgan');
const multer = require('multer');
const nunjucks = require('nunjucks');
const mongoClient = require('mongodb').MongoClient;



const path = require('path');
const fs = require('fs');

var db; //데이터베이스 객체를 저장할 변수
var databaseUrl = 'mongodb://localhost:27017/';


const app = express();
app.set('port', process.env.PORT || 8001);
app.use(morgan('dev'));

app.get('/', (req, res) => {
    mongoClient.connect(databaseUrl, function(err, database){
    if (err != null){
		res.send("에러 내용:" + err);
    }else{
		res.send('데이터베이스에 연결됨: ' + databaseUrl);
    }
    })
});


app.get('/item/list', (req, res) => {
    mongoClient.connect(databaseUrl, function(err, database){
    	if (err != null){
			res.json({'count':0});
    	}else{
			db = database.db('nodemongo');
    	    db.collection("item").find().toArray(function (err, items) {
    	        if(err != null){
        	        res.json({'count':0});
            	}else{
         	       res.json({'count':items.length, 'list':items});
        	   	 }
      	 	})
    	}
    })
});

app.get('/item/detail', (req, res) => {
    //파라미터 읽기 - 파라미터는 항상 문자열
    const itemid = req.query.itemid
    mongoClient.connect(databaseUrl, function(err, database){
    	if (err != null){
			res.json({'item':null});
    	}else{
			db = database.db('nodemongo');
    	    db.collection("item").findOne({'itemid':Number(itemid)},(function (err, items) {
    	        if(err != null){
					res.json({'item':null});
            	}else{
         	       res.json({'item':items});
        	   	}
      	 	}))
    	}
    })
});

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
app.get('/item/insert', (req,res)=>{
	//html 파일 출력
    //__dirname은 현재 디렉토리
    //현재 디렉토리의 index.html 파일을 전송
    res.sendFile(path.join(__dirname, '/insert.html'))
})

//item/insert(post) 요청을 처리
app.post('/item/insert', upload.single('pictureurl'), (req, res) => {
    const itemname = req.body.itemname;
	const description = req.body.description;
	const price = req.body.price;   
    var pictureurl;
	if(req.file){
	 pictureurl = req.file.filename
	}else{
	 pictureurl = "default.jpg";
    }
    
    //데이터베이스 연결
    mongoClient.connect(databaseUrl, function(err, database){
    	if (err != null){
			res.json({'result':false});
    	}else{
            //nodemongo라는 데이터베이스 사용할 수 있도록 db에 설정
            db = database.db('nodemongo');
            //가장 큰 itemid를 가져오기
            db.collection("item").find({},{projection:{_id:0, itemid:1}}).sort({'itemid':-1}).limit(1).toArray(function(err, result){
                if (err){
                    throw err;
                }else{
                    var itemid = 1
                    if(result.length != 0){
                        itemid = result[0].itemid + 1
                    }
                    //데이터 삽입
                    db.collection('item').insert({'itemid':itemid, 'itemname':itemname, 
                    'price':price, 'description':description, 'pictureurl':pictureurl},
                    function(err,result){
                        if(err != null){
                            res.json({'result':false});
                        }else{
                            res.json({'result':true});
                            const writeStream = fs.createWriteStream('./update.txt')
                            writeStream.write(Date.now().toString())
                            writeStream.end
                        }
                    })
                }
            })
    	}
    })
})

const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended:true
}))

//item/delete(get) 요청을 처리
app.get('/item/delete', (req,res,next)=>{
	//html 파일 출력
    //__dirname은 현재 디렉토리
    //현재 디렉토리의 index.html 파일을 전송
    res.sendFile(path.join(__dirname, '/delete.html'))
})


//item/delete post
app.post("/item/delete", (req, res) => {
	

	var itemid = req.body.itemid;
	//데이터베이스 작업
	mongoClient.connect(databaseUrl, function(err, database){
        if (err != null){
			res.json({'result':false});
    	}else{
			db = database.db('nodemongo');
    	    db.collection("item").deleteOne({'itemid':Number(itemid)},(function (err, result) {

                //지워진 행이 없는 경우
    	        if(result.result.n == 0){
                    res.json({'result':false});
                    const writeStream = fs.createWriteStream('./update.txt')
                    writeStream.write('바보야 실패했어.')
                    writeStream.end
            	}else{
                    res.json({'result':true});
                    const writeStream = fs.createWriteStream('./update.txt')
                    writeStream.write(Date.now().toString())
                    writeStream.end
        	   	}
      	 	}))
    	}
    })
})

//app.js 파일에 추가하고 실행
app.get('/item/date', (req, res) => {
	fs.readFile('./update.txt', function (err, data) { 
		res.json({'result':data.toString()})
	})
});

// 파일 다운로드
var util = require('util')
var mime = require('mime')



//img/이미지파일이름 요청을 처리하는 코드
app.get('/img/:fileid', function(req, res){
    var fileId = req.params.fileid;
    var file = '/Users/marco/Desktop/eclipseworkspace/node/NodeMongoDB/img' + '/' + fileId;
    console.log("file:" + file);
    mimetype = mime.lookup(fileId);
    console.log("file:" + mimetype);
    res.setHeader('Content-disposition', 'attachment; filename=' + fileId);
    res.setHeader('Content-type', mimetype);
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
})

app.listen(app.get('port'), () => {
  	console.log(app.get('port'), '번 포트에서 대기 중');
	console.log('NodeMongoDB Server 정상 동작 중')
});