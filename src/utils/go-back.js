export const goBack = () => {
    const orderNo = localStorage.getItem("ordenNo")
    localStorage.clear()
    if (orderNo !== null) {
        localStorage.setItem("ordenNo", orderNo)
    }
    document.location.href = "index.html"
}