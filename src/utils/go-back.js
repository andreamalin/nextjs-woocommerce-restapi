export const goBack = () => {
    const orderNo = localStorage.getItem("ordenNo")
    localStorage.clear()
    if (orderNo !== null) {
        localStorage.setItem("ordenNo", orderNo)
    }

    setTimeout(() => {
        document.location.href = "index.html"
    }, 600)
}