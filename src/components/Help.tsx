function Help() {
    return (
      <div className="Help">
        使用方法<br />
        １．一番上のテキストボックスに適当な文を入れます。<br />
        ２．レベルを選択します。<br />
        　　文字種を変える時はLv.3以上<br />
        ３．文字種を変えたい時はコンボボックスから選択します。<br />
        　　呪文っぽくしたい時はルーン文字とかを選びます。<br />
        　　むしろそれ以外は特に未チェック。<br />
        ４．更新ボタンを押します。<br />

        <ul>
            <li>Lv.1 入れ替え</li>
            <li>Lv.2 反転＋入れ替え(Lv.1)</li>
            <li>Lv.3,4,5 文字ずらし＋ Lv.2</li>
            <li>Lv.3 以降、文字種適用</li>
        </ul>
      </div>
    );
  }
  
  export default Help;
  