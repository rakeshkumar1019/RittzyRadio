var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var path = require('path');


let=PORT=process.env.PORT || 8080;

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'ritzzyradio'
});
connection.connect(function(err){
    if(err) throw err;
    console.log("database is connected");
});

var app = express();
app.set('view engine','ejs');
app.use(express.static("css"));
app.use(express.static("images"));
app.use(express.static("videos"));
app.use(express.static("js"));
app.use(flash());

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(req,res) {
res.sendFile("register.html",{root:__dirname});
});

app.post('/reg',function(req,res){
    var username  = req.body.username;
    var email =req.body.email;
    var password  = req.body.password;
    var phone =req.body.phone;
    var sql="insert into users values(null,'"+req.body.username+"','"+req.body.email+"','"+req.body.password+"','"+req.body.phone+"')";
     connection.query(sql,function(err){
         if(err) throw err;
         res.redirect('/login');
     }); 
})

app.get('/login', function(req,res) {
    res.sendFile("login.html",{root:__dirname});
});


app.post('/auth', function(req,res) {
	var email = req.body.email;
	var password = req.body.password;
	if (email && password) {
		connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.email = email;
			res.redirect('/dashboard');
			} else {
			res.send('Incorrect email and/or Password!');
			}			
		res.end();
		});
	} else {
	res.send('Please enter email and Password!');
	res.end();
	}
});

app.get('/dashboard', function(req,res) {
	if(req.session.loggedin){
	var sql="select username,phone,email from users where email='"+req.session.email+"'";
    connection.query(sql, function(error, results, fields){
			res.render('dashboard',{resul:results[0]});
	}); 
    }else{
		 
		res.redirect('/login');
	}
});

app.get('/logout',function(req,res){    
req.session.destroy(function(err){  
        if(err) throw err;
        res.redirect('/'); 
	   }); 
}); 

app.listen(PORT,function(err){
    if(err) throw err;
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
}); 
 