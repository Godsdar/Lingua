import { notebookHome } from './domain/entry'

const home = notebookHome(location.href)
const link = document.getElementById('notebook-home') as HTMLAnchorElement | null
if (link) link.href = home
location.replace(home)
