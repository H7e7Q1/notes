var arr=[23,55,2,11,34,55,2,47,18,90,63]
function quickSort(arr){
    if(arr.length<2) return arr
    let len=Math.floor((arr.length-1)/2)
    let pivot=arr[len]
    arr.splice(len,1)
    let left=[]
    let right=[]
    arr.forEach(ele => {
        ele<pivot? left.push(ele): right.push(ele)
    });
    return quickSort(left).concat(pivot).concat(quickSort(right))
}
console.log(quickSort(arr));