
const socket = io();
let username = "";

window.onload = pageLoad;

function pageLoad() {
    console.log("Page Loaded!");

    let submitmsg = document.getElementById("submitmsg");
    let clickok = document.getElementById("clickok");

    clickok.addEventListener("click", setUsername);

    submitmsg.addEventListener("click", sendToAll);

    document.getElementById("userMsg").addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            sendToAll();
        }
    });
}

// รับ Socket ID จาก Server
socket.on('your id', function(id) {
    console.log('Your socket ID is: ' + id);

    document.getElementById("your_id").textContent = id;
});

// รับข้อความจาก Server
socket.on('message_received', (data) => {
    postMsg(data);
});

// ส่งข้อความไปยังทุกคน รวมตัวเองด้วย
function sendToAll() {
    let d = new Date();

    // รับข้อความจากช่อง Input
    let text = document.getElementById("userMsg").value.trim();

    if (text === "") return;

    // กำหนดเวลาปัจจุบัน
    let time = d.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    // ส่งข้อมูลไปยัง Server
    socket.emit('send_to_all', {
        time: time,
        user: username,
        text: text
    });

    // ล้างช่องข้อความ
    document.getElementById("userMsg").value = "";
}

// แสดงข้อความใน Chatbox
function postMsg(msg) {
    let x = document.getElementById("chatbox");

    console.log(msg);

    let div_d = document.createElement("div");
    div_d.className = "message";

    let timemsg = document.createTextNode("(" + msg.time + ") ");

    let boldmsg = document.createElement("b");
    boldmsg.textContent = msg.user;

    let textmsg = document.createTextNode(": " + msg.text);

    div_d.append(timemsg, boldmsg, textmsg);
    div_d.appendChild(document.createElement("br"));

    x.appendChild(div_d);

    checkScroll();
}

// กำหนด Username
function setUsername() {
    console.log("OK Button Clicked!");

    let userInput = document.getElementById("userInput");

    username = userInput.value.trim();

    if (username === "") {
        alert("Please enter your username");
        return;
    }

    document.getElementById("username").textContent = username;

    document.getElementById("submitmsg").disabled = false;
    document.getElementById("clickok").disabled = true;

    readLog();
}

// อ่านประวัติข้อความจาก Server
const readLog = async () => {
    try {
        const response = await fetch("/readlog");

        const logs = await response.json();

        // วนลูปแสดงข้อความเก่าทั้งหมด
        logs.forEach((msg) => {
            postMsg(msg);
        });

    } catch (error) {
        console.error("Cannot read chat history:", error);
    }
};

// เลื่อน Chatbox ลงมาด้านล่าง
function checkScroll() {
    let chatbox = document.getElementById("chatbox");

    chatbox.scrollTop = chatbox.scrollHeight;
}
