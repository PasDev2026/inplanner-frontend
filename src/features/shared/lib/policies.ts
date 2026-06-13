const isManager = (managerId: number, userId: number) => {
    return managerId === userId
}
export default isManager