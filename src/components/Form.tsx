import React, { ChangeEventHandler, useState } from "react";
import "./Form.css";
import Help from "./Help";

class RoundRange{
  Name:string;
  DisplayName:string;
  Minimum:number;
  Maximum:number;
  Range:number;
  Key:string;

  constructor(name:string,min:number,max:number){
    this.Name = name;
    if(min === 0){
      this.DisplayName = name;
    }else{
      this.DisplayName = name + " : " + String.fromCodePoint(min) + " - " + String.fromCharCode(max);
    }
    this.Minimum = min;
    this.Maximum = max;
    this.Range = max - min + 1;

    this.Key = min.toString() + "-" + max.toString();
  }
}
const RoundRanges = [new RoundRange("選択",0,0),
                    //ビルマ文字 "က" - "႟"
                    new RoundRange("ビルマ文字" , 0x1000, 0x109F),
                    //アラビア文字 "؀" - "ۿ"
                    new RoundRange("アラビア文字" , 0x0600, 0x06FF),
                    //ルーン文字 "ᚠ" - "ᛸ"
                    new RoundRange("ルーン文字" , 0x16A0, 0x16F0),
                    new RoundRange("ルーン文字+" , 0x16A0, 0x16F8),

                    //タイ文字 "ก" - "๛"
                    new RoundRange("タイ文字" , 0x0E01, 0x0E5B),                    

                    //グルジア文字 Ⴀ - ჿ
                    new RoundRange("グルジア文字" , 0x10A0, 0x10FF),
                    //シンハラ文字 ඀ - ෴
                    new RoundRange("シンハラ文字" , 0x0D80, 0x0DF4),
                    //テルグ文字 ఀ - ౿
                    new RoundRange("テルグ文字" , 0x0C00, 0x0C7F),
                    //カンナダ文字 ಀ - ೳ
                    new RoundRange("カンナダ文字" , 0x0C80, 0x0CF3),
                    //マラヤーラム文字 ഀ - ൿ
                    new RoundRange("マラヤーラム文字" , 0x0D00, 0x0D7F),
                    
                    //ヒエログリフ 𓀀 - 𓃟
                    new RoundRange("ヒエログリフ" , 0x13000, 0x1342F),



                    //パスパ文字 ꡀ - ꡷
                    new RoundRange("パスパ文字" , 0xA840, 0xA87E),
                    
                    //ブラーフミー文字 $𑀀 -𑁵
                    new RoundRange("ブラーフミー文字" , 0x11000, 0x1107F),

                    //ヴァイ文字
                    new RoundRange("ヴァイ文字" , 0xA500, 0xA62B),

                    //デーヴァナーガリー  サンスクリット語
                    new RoundRange("デーヴァナーガリー" , 0x0900, 0x097F),
];
const RoundRangeOptions = RoundRanges.map((range) => {
  return (
    <option value={range.Name} key={range.Key}>
      {range.DisplayName}
    </option>
  );
});

const Form = () => {    
    const [srcText,setSrcText] = useState("ここに入力");
    const [level,setLevel] = useState(5);
    const [roundRange,setRoundRange] = useState(RoundRanges[0]);
    const [dstText,setDstText] = useState("");

    const isSeparator = (c:string) : boolean =>{
      //空白文字
      const pattern = /^([\s]|　)+?$/u;
      if(c.match(pattern)){return true;}
      //句読点やら
      if("\r\n,.、。・;:'\"\\".includes(c)){return true;}
      //ルビ関連
      if("|《》".includes(c)){return true;}
      //かっこ系やら色々
      if("「」[]《》【】()（）『』〚〛".includes(c)){return true;}
      if("―…?？!！".includes(c)){return true;}
      return false;
    }
    const isNumber = (c:string) : boolean => {
      if("0123456789０１２３４５６７８９".includes(c)){return true;}
      return false;
    }
    const isSkipChar = (c:string):boolean =>{
      //TODO getNextCharでずらした先が問題のある文字の場合に飛ばす
      if(isSeparator(c)){return true;}
      if(isNumber(c)){return true;}

      //Cnは動作しているかも
      //Cc	Control	a C0 or C1 control code
      //Cf	Format	a format control character
      //Cs	Surrogate	a surrogate code point
      //Co	Private_Use	a private-use character
      //Cn	Unassigned	a reserved unassigned code point or a noncharacter
      //C	Other	Cc | Cf | Cs | Co | Cn
      const patternUnassigned = /^\p{C}$/u;
      if(c.match(patternUnassigned)){return true;}
      
      return false;
    }
    const getNextChar = (c:string,inc:number,round:RoundRange):string => {
      //数字等はややこしくなるためそのまま
      if(isSkipChar(c)){return c;}
      do{
        let n = c.codePointAt(0)!;
        n += inc;
        if(round.Minimum !== 0){
          //丸める場合、復号は考慮されません
          n = round.Minimum + (n % round.Range);
        }
        c = String.fromCodePoint(n);        
      }while(isSkipChar(c));
      return c;
    }

   const Split = (line:string):[string,boolean][] => {
      let results : [string,boolean][] = [];
      let stack : string[] = [];
      for(const c of line.split("")){
        if(isSeparator(c)){
          if(stack.length > 0){
            results.push([stack.join("")!,false]);
            stack = [];
          }
          results.push([c,true]);
        }else{
          stack.push(c);
        }
      }  
      if(stack.length > 0){
        results.push([stack.join("")!,false]);
        stack = [];
      }
      return results;
   }
    const Convert = (line:string):string =>{
      let results : string[] = [];
      for(const t of Split(line)){
        const [word,isSep] = t;
        if(isSep){
          //区切り文字はそのまま処理
          results.push(word);
        }else{
          results.push(Execute(level,word));
        }
      }
      return results.join("");
    }

    const Execute = (level:number,line: string):string => {
      let s = line;
      if(level === 1){
        //反転
        s = strSwap(s);
      }else if(level === 2){
        s = Execute(1,strReverse(s));
      }else{
        //3以上はもじをずらしてから処理
        //  レベルでずらす量がすこし異なる
        const inc:number = (level - 3) + line.length;
        let conv:string[] = [];
        for(const c of line.split("")){
          conv.push(getNextChar(c,inc,roundRange));
        }
        s = Execute(2,conv.join(""));
      }
      return s;
    }
    const cnvGutyaGutya = (s: string) => {
        setDstText(Convert(s));
    };
    const strReverse = (s: string):string => {
        return s.split("").reverse().join("");
    };
    const strSwap = (s:string):string => {
      let results : string[] = [];
      let stack : string[] = [];
      for ( const c of s.split("")){
        stack.push(c);
        if(stack.length === 2){
            results.push(stack.pop()!);
            results.push(stack.pop()!);
        }
      }
      if(stack.length > 0){
        results.push(stack.pop()!);
      }
      return results.join("");
    };

    const RoundRangeSelector = () => {
      const onRoundRangeChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
        for(const range of RoundRanges){
          if(e.target.value === range.Name){
            setRoundRange(range);
          }
        }
      };
    
      return (
        <div>
        <select onChange={onRoundRangeChange}>
          {RoundRangeOptions}
        </select>
        </div>
      );
    }
    
    return (
        <div>
          <div className="SrcText">
            <textarea name="srcText" onChange={e => {setSrcText(e.target.value); cnvGutyaGutya(e.target.value);}}>{srcText}</textarea>
          </div>
          <div className="SelectorParent">
          <select className="SelectorChild" onChange={e => {
              setLevel(Number(e.target.value));
              cnvGutyaGutya(srcText);
              }}>
            <option value="1">Lv.1</option>
            <option value="2">Lv.2</option>
            <option value="3">Lv.3</option>
            <option value="4">Lv.4</option>
            <option value="5">Lv.5</option>
          </select>
            <RoundRangeSelector />
            <button className="SelectorChild" onClick={e => cnvGutyaGutya(srcText)}>更新</button>
          </div>
          <div>
            Lv.{level} {roundRange.Name}
          </div>
          <div className="DstText">
            <textarea name="dstText" value={dstText} readOnly />
          </div>
          <Help />
        </div>        
    );
};

export default Form;