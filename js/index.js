transferToDecimal = (num, no) => {
    if (!num) return
    // transferToDecimal 必须传字符串
    if (typeof unm !== 'string') {
      num += ''
    }
    let [integer, decimal] = num.split('.')
    // 解决整数位'00021' => '21'
    integer = String(+integer)
    decimal = decimal !== undefined ? decimal : ''
  
    // 整数位最多12位
    if (!no) {
      if (integer.length > 12) {
        integer = '999999999999'
      }
    }
  
    // 保留两位小数 多余舍弃
    if (decimal && decimal.length >= 2) {
      decimal = decimal.substr(0, 2)
    }
  
    // 整数位转变千分位 注意 “$&,”的应用
    integer = integer.replace(/\d(?=(\d{3})+$)/g, '$&,')
  
    // 区分整数与浮点小数
    return num.split('.').length > 1 ? `${integer}.${decimal}` : `${integer}` + '.00'
  }
 
  console.log( transferToDecimal(282000))