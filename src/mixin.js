import { mapState, mapGetters, mapActions } from './helpers'

function assignComponentOption (option, mapper, mapping, omitNamespace, namespace) {
  const createNamespace = key => `${namespace || ''}${namespace && key ? '/' : ''}${key || ''}`

  if (Array.isArray(mapping)) {
    let namespacedMapping

    if (!omitNamespace) {
      namespacedMapping = mapping.map(createNamespace)
    } else {
      namespacedMapping = {}

      for (const key of mapping) {
        namespacedMapping[key] = createNamespace(key)
      }
    }

    Object.assign(option, mapper(namespacedMapping))
    return
  }

  if (typeof mapping !== 'object') {
    // do nothing, dunno what this is
    return
  }

  let aliasedMapping

  for (const key in mapping) {
    if (typeof mapping[key] === 'object') {
      assignComponentOption(
        option,
        mapper,
        mapping[key],
        omitNamespace,
        createNamespace(key)
      )
      continue
    }

    if (mapping[key]) {
      aliasedMapping = aliasedMapping || {}
      const aliasedKey = omitNamespace ? key : createNamespace(key)
      aliasedMapping[aliasedKey] = createNamespace(mapping[key] === true ? aliasedKey : mapping[key])
    }
  }

  if (aliasedMapping) {
    Object.assign(option, mapper(aliasedMapping))
  }
}

export default {
  beforeCreate () {
    const mapping = this.$options.statorMap
    if (!mapping) {
      return
    }

    const omitNamespace = !('omitNamespace' in mapping) || mapping.omitNamespace

    for (const type in mapping) {
      const typeMapping = mapping[type]

      let optionKey
      let mapper

      if (type === 'actions') {
        optionKey = 'methods'
        mapper = mapActions
      } else {
        optionKey = 'computed'
        mapper = type === 'state' ? mapState : mapGetters
      }

      this.$options[optionKey] = this.$options[optionKey] || {}

      assignComponentOption(
        this.$options[optionKey],
        mapper,
        typeMapping,
        omitNamespace
      )
    }
  }
}