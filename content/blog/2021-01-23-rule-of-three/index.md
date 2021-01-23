---
title: "1, 2, Refactor! เมื่อไหร่ที่ควร Refactor?"
date: "2021-01-23T00:00:00.000Z"
tags: ["refactoring","productivity","webdev"]
featuredImage: "./asset-1.jpg"
published: true
---

ช่วงนี้มีโอกาศกลับไปอ่านหนังสือเล่มเก่า ๆ บนตู้หนังสืออย่าง [Refactoring: Improving the Design of Existing Code](https://www.oreilly.com/library/view/refactoring-improving-the/9780134757681/)
 ของ Martin Fowler
 
มันเป็นหนังสือหนึ่งที่หยิบมาอ่านเมื่อไหร่ ก็มักจะได้เห็นมุมมองใหม่ ๆ เสมอ อ่านปีที่แล้ว ก็เห็นอีกแบบ พอทำงานมาปีหนึ่งแล้วหยิบมาอ่าน เราก็จะเห็นอีกแบบ 

ไหนๆ หยิบมาอ่านแล้ว เลยถือโอกาศเล่าให้ฟังกันในหัวข้อเล็ก ๆ เบา ๆ อย่าง [The Rule of Three](https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)) กันครับ

หรือที่หลายคนรู้จักใจ **1, 2, Refactor!**

เริ่มจากอะไรคือ Rule of Three กันก่อน .. 

![Three! (https://unsplash.com/photos/TkoBFUDSqtA)](./asset-1.jpg)

# The Rule of Three

กฏข้อนี้ถูกพูดถึงในหัวข้อ When Should We Refactor? ในหนังสือครับ ผมเลยหยิบเอาส่วนหนึ่งของในหนังสือมาให้อ่านกัน

> Here’s a guideline Don Roberts gave me: The first time you do something, you just do it. The second time you do something similar, you wince at the duplication, but you do the duplicate thing anyway. The third time you do something similar, you refactor.
>
> Or for those who like baseball: **Three strikes, then you refactor.**

จาก Quote ข้างบน จะอธิบายง่าย ๆ ว่า

1. ถ้าเราต้องเขียนโค้ดครั้งแรก ก็แค่เขียนไป
2. ถ้าเราต้้องเขียนโค้ดแบบเดิม ครั้งนี้เรารู้้ตัวนะว่ามัน Duplicate แต่ก็เขียนไปก่อน ไม่จำเป็นต้องทำอะไรตอนนี้
3. ถ้าเราต้องเขียนโค้ดแบบเดิม(อีกครั้ง) ครังนี้ให้เรา Refactor โค้ดส่วนนั้นเลย

ง่ายใช่ไหมครับ ผมสรุปเลยว่ากฏข้อนี้เอาไว้ใช้ตอน **เราไม่แน่ใจว่าตอนนี้เราควร Refactor โค้ดของเรารึยัง** ถ้าจังหวะไหนที่ไม่มั่นใจขึ้นมา ให้นับ 1, 2, Refactor ได้เลยครับ


# Beyond The Rule of three

ความคิดเห็นส่วนตัวของผม กฏ Rule of Three นั้นทำให้เราเห็นว่าการมี Duplicate Code มันถือว่ายังโอเคนะ ถ้าไม่ซ้ำกันมาก หรือตราบเท่าที่มันยังเข้าใจง่ายอยู่ 

แต่เมื่อใดก็ตามที่รู้สึกว่า มันเริ่มซ้ำละ ถ้ามันมี 3 ครั้ง มันอาจจะมีครั้้งที่ 4 ฉะนั้นควร Refactor มันซะตอนนี้เลย

แต่ทุกอย่างที่กล่าวมาด้านบนมันก็แค่ Principle และจริง ๆ บางครั้งสำหรับผม เราไม่จำเป็นต้อง apply มันทุก ๆ ครั้งก็ได้

เช่น เราเห็นแล้วว่ามันซ้ำกัน 3 ครั้ง แต่เราไม่รู้ว่าจะ Refactor มันออกมาแบบไหนดี / เราจะแยกมันออกมาเป็น Function แต่ไม่รู้จะตั้งชื่อ Function ใหม่ออกมาว่ายังไงดี

ถ้าเกิดเป็็นแบบนั้น เป็นผมจะปล่อยมันไปก่อนนะ อาจจะแค่ใส่ Comment ทิ้งไว้ให้พอจำได้ ถึงจุดหนึ่งเมื่อมันมีครั้งที่ 4 ค่อยกลับมาคิดก็ไม่สาย หรือกลับมาคิดตอนที่เรามี Context มากกว่านี้แทน ดีกว่าฝืนทำมันไป

เพราะจุดประสงค์ของ Refactor ทำให้เราเข้าใจโค้ดได้ง่ายขึ้น หาใช่ซับซ้อนกว่าเดิมนั่นเอง

> “Duplication is far cheaper than the wrong abstraction”
>
> – Sandi Metz, All the little things

![Good! (https://unsplash.com/photos/3KEFp35FVB0)](./asset-2.jpg)
