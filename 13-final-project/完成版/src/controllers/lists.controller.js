import * as listsService from '../services/lists.service.js'

export async function list(req, res) {
  res.json(await listsService.listLists())
}

export async function get(req, res) {
  res.json(await listsService.getList(Number(req.params.id)))
}

export async function create(req, res) {
  res.status(201).json(await listsService.createList(req.body))
}

export async function remove(req, res) {
  await listsService.deleteList(Number(req.params.id))
  res.status(204).send()
}
