import { eventmit } from 'eventmit'
import { ulid } from 'ulid'

export class VEditorId {
  type = 'VEditorId' as const
  constructor(public value: string) {}
}

export type VEditor = {
  id: VEditorId
  text: string
}

export type UpdatableVEditorProps = Omit<VEditor, 'id'>

export const createVEditor = (text = ''): VEditor => {
  const id = new VEditorId(ulid())
  return {
    id,
    text,
  }
}

export const updateVEditor = (vEditor: VEditor, newVEditor: Partial<UpdatableVEditorProps>): VEditor => {
  return {
    ...vEditor,
    ...newVEditor,
    id: vEditor.id,
  }
}

export class DomainMap<Domain extends VEditor> extends Map<Domain['id'], Domain> {
  private __last__value__: undefined | Domain
  private events = eventmit<void>()

  read(): undefined | Domain {
    return this.__last__value__
  }

  write(entity: Domain): this {
    return this.set(entity.id, entity)
  }

  set(key: Domain['id'], value: Domain): this {
    super.set(key, value)
    this.__last__value__ = value
    this.events.emit()
    return this
  }

  onChange(changeHandler: () => void): () => void {
    this.events.on(changeHandler)
    return () => {
      this.events.off(changeHandler)
    }
  }
}

export const createVEditorRepository = <T extends VEditor>() => {
  return new DomainMap<T>()
}

export const vEditorRepository = createVEditorRepository()
