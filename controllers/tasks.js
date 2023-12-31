const Task = require('../models/task')

exports.getTaskDay = async function (request, response) {
  const { year, month, day } = request.params
  const userId = request.session.userid
  const deleted = false
  try {
    // FIXME duplication code
    const tasksToday = await Task.find({ month, year, day, deleted, userId })
    response.status(200).send({ status: 200, body: JSON.stringify(tasksToday) })
  } catch (err) {
    console.log('error getting tasks')
    response.status(500).send({ status: 500, body: 'error getting day tasks' })
  }
}

exports.getTasksMonth = async function (request, response) {
  const { year, month } = request.params
  const userId = request.session.userid
  const deleted = false
  try {
    // FIXME duplication code
    const tasksToday = await Task.find({ month, year, deleted, userId })
    response.status(200).send({ status: 200, body: JSON.stringify(tasksToday) })
  } catch (err) {
    console.log('error getting tasks')
    response
      .status(500)
      .send({ status: 500, body: 'error getting month tasks' })
  }
}

exports.postTaskDay = async function (request, response) {
  const { taskName, timeStart, duration, taskDate } = request.body
  if (taskDate && taskName && timeStart && duration > 0) {
    let [year, month, day] = taskDate.split('-')
    month = (Number(month) + 1).toString() // months from 0-11 to 1-12
    const [hour, minutes] = timeStart.split(':')
    const newTask = new Task({
      day: day,
      month: month,
      year: year,
      startHour: Number(hour),
      startMinutes: minutes,
      endHour: Number(hour) + Number(duration),
      endMinutes: minutes,
      taskName: taskName.trim(),
      userId: request.session.userid,
      userName: request.session.user,
    })

    try {
      newTask.save()
      response.status(200).redirect(`/dates/${year}/${month}`)
    } catch (err) {
      response.status(500)
      console.log('error creating task in db')
    }
  } else {
    response.status(400).redirect('/')
  }
}

exports.deleteTask = async function (request, response) {
  const id = request.params.idTask
  const userId = request.session.userid

  // change deleted property to true
  try {
    const taskToDelete = await Task.findOneAndUpdate(
      { _id: id, userId: userId },
      { deleted: true }
    )
    console.log('task to delete: ', taskToDelete)
    console.log('deleted task: ', id, userId)

    response.status(200).send('ok')
  } catch (err) {
    console.log('not found or error deleting', err)
  }
}
