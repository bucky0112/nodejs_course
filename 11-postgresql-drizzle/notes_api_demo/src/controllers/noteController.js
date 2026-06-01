import { noteService } from '../services/noteService.js'

export const noteController = {
  // GET /api/notes
  async getAll(req, res, next) {
    try {
      const notes = await noteService.findAllWithAuthor()
      res.json({ success: true, data: notes })
    } catch (error) {
      next(error)
    }
  },

  // GET /api/notes/:id
  async getById(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const note = await noteService.findByIdWithAuthor(id)

      if (!note) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({ success: true, data: note })
    } catch (error) {
      next(error)
    }
  },

  // POST /api/notes
  async create(req, res, next) {
    try {
      const { title, content, userId } = req.body

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'title 為必填'
        })
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId 為必填'
        })
      }

      const newNote = await noteService.create({
        title,
        content: content || null,
        userId
      })
      res.status(201).json({ success: true, data: newNote })
    } catch (error) {
      // 處理外鍵錯誤
      if (error.code === '23503') {
        return res.status(400).json({
          success: false,
          error: '使用者不存在'
        })
      }
      next(error)
    }
  },

  // PUT /api/notes/:id
  async update(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const { title, content } = req.body

      // 建立更新物件
      const updateData = {}
      if (title !== undefined) updateData.title = title
      if (content !== undefined) updateData.content = content

      const updatedNote = await noteService.update(id, updateData)

      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({ success: true, data: updatedNote })
    } catch (error) {
      next(error)
    }
  },

  // DELETE /api/notes/:id
  async delete(req, res, next) {
    try {
      const id = parseInt(req.params.id)
      const deletedNote = await noteService.delete(id)

      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          error: '找不到筆記'
        })
      }

      res.json({
        success: true,
        message: '筆記已刪除',
        data: deletedNote
      })
    } catch (error) {
      next(error)
    }
  }
}
