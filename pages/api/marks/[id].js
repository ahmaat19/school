import nc from 'next-connect'
import dbConnect from '../../../utils/db'
import Mark from '../../../models/Mark'
import { isAuth } from '../../../utils/auth'

const handler = nc()
handler.use(isAuth)

handler.put(async (req, res) => {
  await dbConnect()

  const { isActive, pTwelveSchool, exam, classRoom, subject, student, mark } =
    req.body
  const _id = req.query.id

  const obj = await Mark.findById(_id)

  if (obj) {
    const exist = await Mark.find({
      _id: { $ne: _id },
      pTwelveSchool,
      classRoom,
      subject,
      student,
    })
    if (exist.length === 0) {
      obj.exam = exam
      obj.classRoom = classRoom
      obj.subject = subject
      obj.student = student
      obj.mark = mark
      obj.pTwelveSchool = pTwelveSchool
      obj.isActive = isActive
      await obj.save()

      res.json({ status: 'success' })
    } else {
      return res.status(400).send(`This ${subject} Mark already exist`)
    }
  } else {
    return res.status(404).send('Mark not found')
  }
})

handler.delete(async (req, res) => {
  await dbConnect()

  const _id = req.query.id
  const obj = await Mark.findById(_id)
  if (!obj) {
    return res.status(404).send('Mark not found')
  } else {
    await obj.remove()

    res.json({ status: 'success' })
  }
})

export default handler
