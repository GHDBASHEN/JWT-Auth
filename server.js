import express from 'express';
import jwt from 'jsonwebtoken';
const port = process.env.PORT || 3000;
const app = express();
//const SECRET_KEY = 'xxxx-xxxx';
app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});


app.post('/login', (req, res) => {
  
    //req--->database --->true
    //generate token
    //sign userdata

    var userdata = {id:1,username:"Rajitha",age:25};
    jwt.sign({user:userdata}, "secreatkey", (err, token) => {
            if(err){
                res.json({error:err})}
            else{
                res.json({token:token})
            }
        })
    
    
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });