
var express = require('express');
var app = express();

let http = require('http');
var hostname = 'localhost';
var port = 3001;

var fs = require('fs/promises');
const path = require('path');

const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

// เปิดใช้งานไฟล์ใน Folder เดียวกัน
app.use(express.static(__dirname));

// เชื่อมต่อ Socket.IO
io.on('connection', (socket) => {

    console.log('a user connected');

    // ส่ง Socket ID ให้ Client
    socket.emit('your id', socket.id);

    // รับข้อความจาก Client
    socket.on('send_to_all', async (data) => {

        console.log(`[All] จาก ${socket.id}:`, data);

        // สร้าง Object ของข้อความ
        const new_msg = {
            time: data.time,
            user: data.user,
            text: data.text
        };

        try {

            // บันทึกข้อความลง log.json
            await readandWriteFile(new_msg);

            // ส่งข้อความไปยังทุกคน รวมถึงผู้ส่ง
            io.emit('message_received', new_msg);

        } catch (error) {
            console.error("Cannot save message:", error);
        }

    });

});

// อ่านประวัติข้อความผ่าน HTTP GET
app.get('/readlog', async (req, res) => {

    try {

        const logs = await readFile();

        // ส่งข้อมูลกลับไปยัง Client ในรูปแบบ JSON
        res.json(logs);

    } catch (error) {

        console.error(error);
        res.status(500).json({ error: "Cannot read log file" });

    }

});

// กำหนดตำแหน่งไฟล์ log.json
const logPath = path.join(__dirname, 'log.json');

// อ่านไฟล์ log.json
const readFile = async () => {

    try {

        const data = await fs.readFile(logPath, 'utf8');

        return JSON.parse(data);

    } catch (error) {

        // ถ้ายังไม่มีไฟล์ ให้คืนค่า Array ว่าง
        if (error.code === 'ENOENT') {
            return [];
        }

        throw error;

    }

};

// เขียนข้อมูลลงไฟล์ log.json
const writeFile = async (data) => {

    await fs.writeFile(
        logPath,
        JSON.stringify(data, null, 2),
        'utf8'
    );

};

// อ่านข้อมูลเก่า เพิ่มข้อความใหม่ และเขียนกลับ
const readandWriteFile = async (new_msg) => {

    // อ่านข้อมูลเดิม
    const logs = await readFile();

    // เพิ่มข้อความใหม่ลงใน Array
    logs.push(new_msg);

    // เขียนข้อมูลทั้งหมดกลับลงไฟล์
    await writeFile(logs);

};

// เปิด Server
server.listen(port, hostname, () => {

    console.log(`Server running at http://${hostname}:${port}/`);

});
