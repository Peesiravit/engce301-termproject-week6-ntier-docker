# ENGCE301: N-Tier Architecture, Redis Caching, and Load Balancing

โปรเจกต์นี้เป็นการศึกษาและทดลองออกแบบระบบสถาปัตยกรรมแบบ N-Tier โดยใช้ Docker ในการจำลองสภาพแวดล้อมที่มีทั้งการทำ Caching ด้วย Redis และการทำ Load Balancing ด้วย Nginx เพื่อเพิ่มประสิทธิภาพและความทนทานให้กับระบบ

---

## 🛠 การทดสอบที่ 1: การจัดการ Service Availability & Failover

### ปัญหาที่พบ (Scenario)
จากการจำลองสถานการณ์ Server ล่มด้วยคำสั่ง `docker stop` พบว่าระบบเดิมเกิดปัญหา **Service Disruption** โดยแสดงผลเป็นหน้า Error `502 Bad Gateway` หรือ `504 Gateway Timeout` เนื่องจาก Nginx พยายามเรียกไปยัง Instance ที่ใช้งานไม่ได้แล้ว และไม่มีกลไกในการสลับไปยังตัวที่ยังทำงานอยู่โดยอัตโนมัติ

### แนวทางการแก้ไข (Implementation)
ได้ทำการปรับปรุงการตั้งค่าใน `nginx/default.conf` เพื่อเพิ่มความทนทาน (Resilience):
1. **Dynamic Service Discovery:** ใช้คำสั่ง `resolver` เพื่อให้ Nginx คอยอัปเดต IP Address ของ Service จาก Docker DNS อย่างสม่ำเสมอ
2. **Automatic Failover:** เพิ่มคอนฟิก `proxy_next_upstream` เพื่อให้ระบบทำการสลับไปเรียก App Instance ตัวถัดไปทันทีหากตัวปัจจุบันตอบสนองผิดปกติ

### ผลการทดสอบ
หลังการแก้ไข ระบบสามารถให้บริการได้อย่างต่อเนื่อง (**High Availability**) แม้จะมี Instance บางส่วนล่มไป แต่ผู้ใช้งานฝั่ง Frontend จะไม่พบหน้า Error และสามารถใช้งานได้ตามปกติ

---

## 📈 การทดสอบที่ 2: การวัดประสิทธิภาพผ่าน Horizontal Scaling

ทดสอบประสิทธิภาพการรับโหลดด้วยเครื่องมือ `wrk` ผ่านคำสั่ง:
`wrk -t4 -c50 -d20s http://localhost/api/tasks`

### ตารางเปรียบเทียบผลลัพธ์
| Metric | Case A: 1 Instance (Baseline) | Case B: 3 Instances (Scale-out) |
| :--- | :---: | :---: |
| **Avg Latency** | 25.68 ms | **20.15 ms** |
| **Throughput (Req/s)** | 2,984.25 | **3,226.00** |

**วิเคราะห์ผลการทดลอง:**
- **Latency:** การเพิ่ม Instance ช่วยลดระยะเวลาตอบสนองลงได้ประมาณ 21%
- **Throughput:** อัตราการประมวลผลคำสั่งต่อวินาทีเพิ่มสูงขึ้นอย่างเห็นได้ชัดจากการกระจายโหลดแบบ Round-Robin

---

## 💡 สรุปองค์ความรู้ที่ได้รับ (Key Learnings)

### 1. การออกแบบสถาปัตยกรรม (Architecture Design)
การเลือกโครงสร้างระหว่าง Frontend, Backend และ Database ต้องคำนึงถึงเป้าหมายหลักเป็นสำคัญ เช่น ความเร็ว (Performance), ความพร้อมใช้งาน (Availability) หรือความปลอดภัย (Security)

### 2. กลยุทธ์การเพิ่ม Tier ในระบบ
- **เพิ่ม Cache Tier (Redis):** เมื่อต้องการลดภาระการทำงานหนักของ Database (DB Bottleneck) และเพิ่มความเร็วในการอ่านข้อมูล
- **เพิ่ม Load Balancer Tier (Nginx):** เมื่อต้องการขยายขีดความสามารถ (Scaling) ให้รองรับผู้ใช้งานจำนวนมากพร้อมกัน

### 3. ข้อควรระวัง
ควรระวังเรื่อง **Over-engineering** หากระบบยังมีขนาดเล็กและมีผู้ใช้งานไม่มาก การเพิ่ม Tier ที่ซับซ้อนเกินไปอาจทำให้การบำรุงรักษาทำได้ยากและเพิ่มต้นทุนโดยไม่จำเป็น

---