// Centralized drink menu with temperature options.
export interface MenuItem {
  name: string
  hot: boolean
  iced: boolean
}

export const DEFAULT_MENU: MenuItem[] = [
  { name: 'Black 美式', hot: true, iced: true },
  { name: 'White 拿铁', hot: true, iced: true },
  { name: 'Mocha 摩卡', hot: true, iced: true },
  { name: 'Choc 巧克力', hot: true, iced: true },
  { name: 'Milk 牛奶', hot: true, iced: true },
  { name: 'Piccolo', hot: true, iced: false },
]
