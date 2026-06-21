import * as listsService from '../services/lists.service.js'

export async function list(req, res) {
  res.json(await listsService.listLists())
}
export async function create(req, res) {
  res.status(201).json(await listsService.createList(req.body))
}
