export interface TableItems{
    display:boolean,
    showResult:boolean,
    isEmpty:boolean,
    data: Array<TableItem>
}
export interface TableItem{
    id: string,
    date: string,
    time: string,
    icon: string,
    event: string,
    genre: string,
    venue: string
}
