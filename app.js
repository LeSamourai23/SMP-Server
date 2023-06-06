import express from "express";
import User from "./routers/user.js"
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors"

export const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(cookieParser())
app.use(
    fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        useTempFiles: true
    })
)
app.use(cors())

app.use("/api/v1", User)