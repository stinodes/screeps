export class Body {
  private staticParts: BodyPartConstant[] = []
  private dynamicParts: { [part in BodyPartConstant]?: number } = {}

  public static create(): Body {
    const body = new Body()
    return body
  }
  public addDynamicPart(name: BodyPartConstant, value = 1): Body {
    this.dynamicParts[name] = value
    return this
  }
  public addStaticPart(name: BodyPartConstant, amount = 1): Body {
    this.staticParts = this.staticParts.concat(new Array(amount).fill(name))
    return this
  }

  public build(energy: number): BodyPartConstant[] {
    const bodyKeys = Object.keys(this.dynamicParts) as BodyPartConstant[]
    const totalDynamicValue = Object.values(this.dynamicParts).reduce(
      (prev: number, val) => (val ? prev + val : prev),
      0
    )
    const reCalibratedDynamic = bodyKeys.reduce((prev, part) => {
      const val = this.dynamicParts[part]
      if (val) {
        prev[part] = val / totalDynamicValue
      }
      return prev
    }, {} as { [part in BodyPartConstant]?: number })

    const energyMinusStatics = this.staticParts.reduce(
      (prev, part) => prev - BODYPART_COST[part],
      energy
    )

    const dynamicParts = bodyKeys.reduce((prev, part) => {
      const weight = reCalibratedDynamic[part]
      if (!weight) return prev
      const nParts = Math.floor(
        (energyMinusStatics * weight) / BODYPART_COST[part]
      )
      return prev.concat(new Array(nParts).fill(part))
    }, [] as BodyPartConstant[])

    return this.staticParts.concat(dynamicParts)
  }
}
