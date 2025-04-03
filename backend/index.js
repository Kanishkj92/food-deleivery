import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import userRouter from './routes/auth.route.js'
import foodRoutes from './routes/food.route.js'
import path from 'path'
dotenv.config();
mongoose.connect(process.env.MONGO).then(()=>{
    console.log("connected")
})
.catch((err)=>{
    console.log(err);
})
const __dirname=path.resolve();

const app = express();
app.use(express.json());
app.listen(4000,()=>{
    console.log('Server is running on port 4000!');
})
app.use('/backend/auth',userRouter)
app.use("/backend/food", foodRoutes);
app.use(express.static(path.join(__dirname,'/frontend/dist')))
app.get('*',(req,res)=>{
    res.sendFile(path.join(__dirname,'frontend','dist','index.html'));
})