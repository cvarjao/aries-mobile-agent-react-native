import { Container, TOKENS, TokenMapping } from '@hyperledger/aries-bifold-core'
import { DependencyContainer } from 'tsyringe'

import Button from './components/buttons/Button'

export class AppContainer implements Container {
  private container: DependencyContainer
  public constructor(bifoldContainer: Container) {
    this.container = bifoldContainer.getContainer().createChildContainer()
  }
  public init(): Container {
    // eslint-disable-next-line no-console
    console.log(`Initializing App container`)
    this.container.createChildContainer().registerInstance(TOKENS.COMP_BUTTON, Button)
    return this
  }

  public resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K] {
    // eslint-disable-next-line no-console
    console.log(`resolving ${token}`)
    return this.container.resolve(token) as TokenMapping[K]
  }

  public getContainer(): DependencyContainer {
    return this.container
  }
}
