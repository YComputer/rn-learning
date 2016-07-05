/**
 *
 * Created by weimeng on 16/5/10.
 * © 2016 NCF GROUP ALL RIGHTS RESERVED
 */



import React, {Component} from 'react'
import {connect} from 'react-redux'
import qs from 'qs'
import {
  Text,
  View,
  StyleSheet,
  Alert,
  ProgressViewIOS,
  RefreshControl,
  ActivityIndicatorIOS
} from 'react-native'

import {
  W, H,
  borderGrey,
  grey,
  lightGrey,
  getResponsiveSize,
  PagesConfig,
  parse_url
} from "common/index"


import {navReplaceWithAnimation} from "actions/index"
import BarcodeScanner from './ScannerAndroid';

const strpad = (i, str) => {
  let s = ""
  for(let j = 0; j < i; j++) {
    s += str
  }
  return s
}

class ProductScanner extends Component{
  constructor(){
    super()
    this._onBarcodeRead = this._onBarcodeRead.bind(this)
    this._startTimer = this._startTimer.bind(this)
    this._clearTimer = this._clearTimer.bind(this)
    this.reading = false
    this.state = {
      c : 0,
      hint : ''
    }
    this._startTimer()
  }

  componentDidMount(){
  }

  
  _resetState(callback){
     this.setState({
      c : 0,
      hint : ''
    }, () => {
       callback()
     })
  }

  _startTimer () {

    var c = 0

    this.I = setInterval( () => {
      c ++
      if(c % 3 === 0) {
        c = 0
      }
      this.setState({
        c
      })

    }, 1000)
  }

  _clearTimer () {
    if(this.I)
      clearInterval(this.I)
    this.I = null

  }

  componentWillUnmount(){
    this._clearTimer()
    this.reading = false
  }

  _onBarcodeRead(e){
    const reading = this.reading

    if(reading) {
      return
    }

    this.reading = true
    this.setState({
      hint : ""
    })

    const url = e.data
    console.log("url is :" + url)
    let com_id = null, sku_id = null
    if(url.match(/xinfenqi/)) {
      const prts = parse_url(url)
      const query = qs.parse(prts.query)
      if(query.com_id && query.sku_id) {
        com_id = query.com_id
        sku_id = query.sku_id
      }
    }

    if(!(com_id && sku_id)){
      this.setState({
        hint : "结果不正确请重新扫描"
      })
      setTimeout( (() => {
        this.setState({
          reading : false,
          hint : ""
        })
      }).bind(this), 3000)
    } else {
      this.setState({
        hint : "正在为您跳转"
      })
      setTimeout( (() => {
        this._resetState( (() => {
          this.props.dispatch( navReplaceWithAnimation(PagesConfig.ProductDetail, {com_id, sku_id}))
        }).bind(this))
      }).bind(this), 1000)
    }
  }


  render(){
    const reading = this.reading
    const {c,  hint} = this.state
    const text = hint ? hint + strpad(c, ".") : (reading ? '正在分析结果' : "正在扫描" + strpad(c, "."))

    return (
      <View style={styles.container}>
        <View style={styles.cameraWrapper}>
          <BarcodeScanner
            onBarCodeRead={this._onBarcodeRead}
            style={styles.camera}
            torchMode='off'
            translateY={-W * 0.2}
            cameraType='back'
          />

        </View>
        <View style={styles.indicator}>
          <Text style={styles.indicatorText}>{text}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.font}>将二维码放入框内，即可自动扫描</Text>
          <Text style={styles.font}>亲，扫一扫只支持门店商品</Text>
        </View>
      </View>
    )
  }

}

const S =  W * 0.7
const D =  W * 0.7 + 60
const styles = StyleSheet.create({
  container : {
    flex : 1,
    backgroundColor : lightGrey
  },
  indicator: {
    position : 'absolute',
    flexDirection : 'row',
    bottom : W * 0.3,
    alignItems : 'center',
    justifyContent : 'center',
    width : W,
    height : 20,
  },
  indicatorText : {
    fontSize : getResponsiveSize(10),
    backgroundColor : "rgba(0,0,0,0)",
    color : 'white',
  },
  cameraWrapper : {
    width : W,
    height : H,
    alignItems : 'center',
    justifyContent : "center",
    backgroundColor : 'white'

  },
  cameraBox: {
    position : 'absolute',
    width : S,
    height : S,
    top : (D- S) /2,
    left : (W - S) / 2,
    borderWidth : 2,
    borderStyle : "dashed",
    borderColor : 'rgba(100,100,100, 0.7)',
    borderRadius : 2
  },
  camera : {
    width : W,
    height : H,
  },
  textContainer : {
    position : 'absolute',
    justifyContent : 'center',
    alignItems : 'center',
    bottom : 20,
    width : W
  },
  font : {
    fontSize : getResponsiveSize(13),
    marginBottom : 8,
    color : 'white'
  }
})


module.exports = connect()(ProductScanner)
