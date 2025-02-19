import express from 'express';
import jwt from 'jsonwebtoken';
const port = process.env.PORT;
const app = express();
//const SECRET_KEY = process.env.SECRET_KEY;
app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
});


app.post('/login', (req, res) => {

    //req--->database --->true
    //generate token
    //sign userdata

    var userdata = { id: 2, username: "janith", age: 20 };
    jwt.sign({ user: userdata }, process.env.SECRET_KEY, (err, token) => {
        if (err) {
            res.json({ error: err })
        }
        else {
            res.json({ token: token })
        }
    })


})


app.post('/verify', verifyToken, (req, res) => {

    //check valid user 
    
    jwt.verify(req.token, process.env.SECRET_KEY, (err,data) => {
        if (err) {
            res.json({ msg: "Access Denied" })
        }
        else {
            res.json({ msg:"Data Saved",data:data })
        }
    })
})




function verifyToken(req, res, next) {
    if (typeof req.headers['authorization'] !== 'undefined' && req.headers['authorization'] !== 'undefined') {

        var HeaderToken = req.headers['authorization'].split(' ')[1];
        if (HeaderToken !== 'undefined') {
            req.token = HeaderToken;
            next();
        }
        else {
            res.json({ message: "Unauthorized Request" });
        }

    }
    else {
        res.json({ message: "Unauthorized Request" });
    }

}


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});