import * as tagsService from '../services/tags.service.js'

export async function list(req, res) {
  res.json(await tagsService.listTags())
}
export async function create(req, res) {
  res.status(201).json(await tagsService.createTag(req.body))
}
