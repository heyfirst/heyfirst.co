---
TODO: Finish the article
TODO: Add images (featuredImage)
TODO: Publish on heyfirst.co
TODO: Publish on dev.to
title: "How I organize Tailwind CSS in React"
date: "2021-01-22T00:00:00.000Z"
tags: ["tailwind","react","component","productivity","webdev"]
featuredImage: "./asset-1.jpeg"
published: false
---

หลังจากที่ผมใช้ Tailwind CSS มาประมาณหนึ่งแล้ว ประกอบกับได้้ฟังพี่ Chris แชร์เรื่อง Organizing codebase structure for UI components และผมก็นำไป Refactor ตัวโค้้ดที่ผมใช้อยู่ ส่วนตัวผมค่อนข้างชอบมันนะ เลยอยากจะเขียนเก็บเอาไว้เผื่ออ่านวันหน้า

ทุกวันนี้ผมใช้ React เป็นหลัก และหลังจากนี้ทั้งหมด ก็จะเป็น Sample ที่เป็น React นะครับ งั้นเรามาเริ่มกันเถอะ

## 1. Extract to Component
สิ่งแรกที่ผมมักจะทำเมื่อผมใช้ Tailwind ไปได้ซักพักหนึ่งคือการ Extract มันออกมาเป็น Component ย่อย ๆ ซึ่งทุกคนมักจะทำกันอยู่แล้วใช่ไหมครับ


## 2. Extract Component classes 
สิ่งที่สองที่ผมมักจะทำคือการเอา classnames ของ tailwind มาห่อไว้เป็นชุด ๆ 

```css
@layer components {
  .primary-text {
    @apply text-indigo-700;
  }

  .secondary-text {
    @apply text-gray-700;
  }

  .loading {
    @apply opacity-50 cursor-not-allowed;
  }

  /* 
    more ...
   */
}
```

อันนี้ผมมักจะสร้างไว้เป็น css classes เลย เพราะใช้บ่อย ๆ 

> สองข้อข้างบนน่าจะเป็น Common Techniques ที่ทุก ๆ คนมักจะใช้กันอยู่แล้ว เพราะมีเขียนแนะนำไว้ใน Tailwind Document นะครับ

> ซึ่งหากเราใช้แค่ 2 เทคนิคด้านบนก็จะสามารถแก้ปัญหาระดับ component ได้แบบทุกชนิดแล้วนั่นเอง

## 3. Organizing UI Component
ท้าวความก่อนว่าจากที่ใช้ 2 ข้อด้านบนอยู่แล้้ว มันช่วยทำให้ Code ของ Tailwind จัดการง่ายขึ้นเยอะมาก ๆ ระดับหนึ่งแล้วครับ แต่บางครั้งการวาง Structure ของ Component ก็สร้างปัญหาให้เราได้มากเหมือนกัน ยกตัวอย่างง่าย ๆ ถ้าเอาทุกอย่างไปไว้ใน components folder คงวุ่นวายน่าดูเวลานั่งหาใช่ไหมครับ

และจากที่คุยกับพี่คริสมา ทำให้ผมปรับ strucure ของ app เป็นแบบนี้
```
- domain
  \chatrooms
    \components
    \hooks
    \pages

  \profile
    \components
    \hooks
    \pages
- ui
  \bases
  \components
  \styles
  \assets
```

เราแยก ui folder ออกมาเลย โดยมี concept ง่าย ๆ ว่า "UI folder ต้องสามารถ Copy and paste ไปที่ไหนก็ได้ แล้วใช้งานได้เลย!"


## 4. Handle UI state with classnames
เหมือนกลับไปสู่ยุคแรกเริ่มเดิมทีเลยนะครับ กับการใช้ classnames module ที่หลายคนคงเคยใช้แล้ว

```javascript
import cx from 'classnames'
...
...
...

const Card = ({ children, loading }) => <div classname={cx('p-4 rounded-sm shadow-sm', {
  'opacity-50 cursor-not-allowed' : loading
})}>
{children}
</div>
```

โค้ดด้านบนนั้นทำงานโดยการที่บอกว่า ถ้า prop loading ที่รับเข้ามาเป็น true ให้เพิ่ม classname 'opacity-50 cursor-not-allowed' เข้าไปนั่นเอง

สำหรับผม ผมเลือกใช้ classnames เพราะมันทำให้โค้ดของเราดูสะอาด เข้าใจได้ง่าย กว่าการใช้ template string แล้วแปะ classname เข้าไปนั่นเอง 

## 5. If you really need custom CSS, Use CSS Modules
กลับไปสู่ basic อีกครั้้งครับ

### 5.1 Why not Styled-component
เพราะมันซ้ำซ้อน เราคาดหวังให้ style ทุกอย่างอยู่ใน CSS สำหรับผมมันก็ควรอยู่แค่ใน CSS และพยายามไม่ให้มันข้ามมา Javascript ถ้าไม่จำเป็น

## 6. Don't do everything by yourself, use Plugin.
* (Official) @tailwindcss/forms
* (Official) @tailwindcss/line-clamp
* tailwindcss-debug-screens

## Keep yourself up-to-date
ข้อสุดท้ายคงแค่บอกเล่าว่า Tailwind CSS ค่อนข้างโตเร็วในช่วงหลายเดือนที่ผ่านมา ผมคิดว่าหลังจากนี้คงจะมีอะไรอีกมากมายให้เราได้ติดตาม หรือ Movement ใหม่ ๆ ในวงการ Frontend อย่างเช่น เช่น https://devdojo.com/tails เป็นต้น ติดตามทั้ง Twitter, Mailing List และ Tailwind Document กันไว้นะครับบบ ช่วยคุณได้แน่นอน 

ทั้งหมดที่กล่าวข้างบนก็เหมือนบันทึกส่วนตัวที่ผมทำให้เพื่อให้ตัวเองจำได้ว่า เราควรคำนึงถึงอะไรบ้างเวลาจะทำงาน Frontend นะครับ หลาย ๆ ข้อที่กล่าวมาข้างบนมันก็ไม่ได้จำกัดอยู่แค่ Tailwind นะ คิดว่าทุกคนน่าจะเอาไปปรับใช้กันได้ครับ

ขอย้ำอีกรอบว่าที่กล่าวมาทั้งหมดผมไม่ได้คิดว่ามันเหมาะ 100% กับงานทุกแบบทุกประเภท หลายครั้งมันคงมีข้อจำกัดบางอย่างที่อาจจะทำให้ทำวิธีนี้ไม่ได้ วิธีนั้นไม่ได้ ก็ควรปรับตัวตามกันไปตามแต่สถานการณ์นะครับ




