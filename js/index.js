(function () {
  const calendar = {
    curDate: new Date(), // 当前的日期对象
    // 节假日数组
    holidays: ['假期安排', '元旦节', '除夕', '春节', '清明节', '劳动节', '端午节', '中秋节', '国庆节'],
    // 初始化
    init() {
      this.renderSelect(this.curDate);
      this.getData(this.curDate);
    },
    // 渲染下拉列表
    renderSelect(d) {
      const yearList = document.querySelector('.yearSelect .selectBox ul');
      const monthList = document.querySelector('.monthSelect .selectBox ul');
      const holidayList = document.querySelector('.holidaySelect .selectBox ul');

      const yearSelected = document.querySelector('.yearSelect .selected span');
      const monthSelected = document.querySelector('.monthSelect .selected span');
      const holidaySelected = document.querySelector('.holidaySelect .selected span'); // 没有假期的接口，直接用holidays数组代替

      // 生成年份（起始年份和结束年份参考提供的数据接口即可）
      let yearli = '';
      yearList.innerHTML = '';
      for (let i = 1900; i <= 2050; i++) {
        yearli += `<li ${i === d.getFullYear() ? 'class="active"' : ''}>${i}年</li>`;
      }
      yearList.innerHTML = yearli;
      yearSelected.innerHTML = d.getFullYear() + '年';

      // 生成月份
      let monthli = '';
      monthList.innerHTML = '';
      for (let i = 1; i <= 12; i++) {
        monthli += `<li ${i === (d.getMonth() + 1) ? 'class="active"' : ''}>${i}月</li>`;
      }
      monthList.innerHTML = monthli;
      monthSelected.innerHTML = (d.getMonth() + 1) + '月';

      // 生成假期
      let holidayli = '';
      holidayList.innerHTML = '';
      for (let i = 0; i < this.holidays.length; i++) {
        holidayli += `<li ${i === 0 ? 'class="active"' : ''}>${this.holidays[i]}</li>`;
      }
      holidayList.innerHTML = holidayli;
      holidaySelected.innerHTML = this.holidays[0];

      // 添加事件
      this.selectBindEvent();
    },
    // 关闭下拉框
    closeSelect() {
      const selects = [...document.querySelectorAll('.select')]; // 所有下拉框，是类数组，使用...转为真正的数组
      let open = selects.find(select => select.classList.contains('active')); // 有active的元素
      open && open.classList.remove('active'); // 只有找到有active的元素后才能进行移除
    },
    // 给下拉框添加事件
    selectBindEvent() {
      const selects = document.querySelectorAll('.select'); // 所有下拉框

      selects.forEach((select, index) => {
        const cl = select.classList; // 元素的class集合
        const selected = select.querySelector('span'); // 点击的那个下拉框里的选中内容

        select.onclick = e => {
          if (cl.contains('active')) { // 点击自己，看自己身上有么有active
            cl.remove('active');
          } else { // 点击别人
            // 移除别人的active
            this.closeSelect();
            // 添加自己的active
            cl.add('active');
            // 添加滚动条，要在元素显示的时候去添加
            this.scrollBar();
          }

          if (e.target.tagName !== 'LI') { // 说明点击的不是li
            return;
          }

          // 点击的是li
          const lis = [...select.querySelectorAll('ul li')];
          lis.find(li => li.classList.contains('active')).classList.remove('active');
          e.target.classList.add('active'); // 自己身上添加一个active

          switch (index) { // 根据索引值区分点击的是谁
            case 0: // 点击的是年
              // 取到点击的年份，把中文去掉，然后把这个年份设置为curDate
              this.curDate.setFullYear(parseInt(e.target.innerHTML));
              selected.innerHTML = e.target.innerHTML;
              break;
            case 1: // 点击的是月
              // 因为月份是从0开始的，所以取到值后需要减1
              this.curDate.setMonth(parseInt(e.target.innerHTML) - 1);
              selected.innerHTML = e.target.innerHTML;
              break;
            case 2: // 点击的是假期
              selected.innerHTML = e.target.innerHTML;
              break;
          }

          // 请求数据
          this.getData(this.curDate);
        }
      })

      this.monthChange(); // 添加切换月份功能
      this.backToday(); // 添加返回今天功能
    },
    // 滚动条
    scrollBar() {
      const scrollWrap = document.querySelector('.yearSelect .selectBox');
      const content = document.querySelector('.yearSelect .selectBox ul');
      const barWrap = document.querySelector('.yearSelect .selectBox .scroll');
      const bar = document.querySelector('.yearSelect .selectBox span');

      // 初始化
      bar.style.transform = content.style.transform = 'translateY(0)';

      // 设置滑块的高度
      let multiple = (content.offsetHeight + 18) / scrollWrap.offsetHeight; // 内容是内容父级的几倍
      multiple = multiple > 20 ? 20 : multiple; // 内容与内容父级的倍数不能超过20
      bar.style.height = scrollWrap.offsetHeight / multiple + 'px'; // 根据倍数算出滑块的高度（相反的关系）

      // 滑块拖拽
      let scrollTop = 0; // 滚动条走的距离
      let maxHeight = barWrap.offsetHeight - bar.offsetHeight; // 滑块能走的最大距离
      bar.onmousedown = function (e) {
        let startY = e.clientY; // 按下时鼠标的坐标
        let startT = parseInt(this.style.transform.split('(')[1]); // ['translateY', '0)']按下时元素走的距离

        bar.style.transition = content.style.transition = null;

        document.onmousemove = e => {
          scrollTop = e.clientY - startY + startT; // 滚动条走的位置
          scroll(); // 走的功能
        }

        document.onmouseup = () => document.onmousemove = null;
      }

      barWrap.onclick = e => e.stopPropagation(); // 在滑块的父级区间内按下鼠标要阻止事件冒泡

      function scroll() {
        if (scrollTop < 0) scrollTop = 0; // 上边走到头了
        if (scrollTop > maxHeight) scrollTop = maxHeight; // 下边走到头了

        let scaleY = scrollTop / maxHeight; // 滚动条走的比例
        bar.style.transform = 'translateY(' + scrollTop + 'px)';
        content.style.transform = 'translateY(' + (scrollWrap.offsetHeight - content.offsetHeight - 18) * scaleY + 'px)';
      }

      scrollWrap.onwheel = e => { // 滚轮滚动事件
        e.deltaY > 0 ? scrollTop += 10 : scrollTop -= 10; // e.deltaY>0表示往下滚动
        bar.style.transition = content.style.transition = '.2s';
        scroll();
        e.preventDefault(); // 阻止默认行为
      }
    },
    // 请求数据
    getData(d) {
      $.ajax({
        url: `https://www.rili.com.cn/rili/json/pc_wnl/${d.getFullYear()}/${d.getMonth() + 1}.js`,
        dataType: 'jsonp',
      });

      window.jsonrun_PcWnl = res => { // 注意：一定要把jsonp里的函数定义成全局的
        this.renderDate(d, res.data); // 渲染日期
        // 渲染农历
        this.renderLunar(res.data.find(item => 
          item.nian === d.getFullYear() && item.yue === (d.getMonth() + 1) && item.ri === d.getDate()));
      }
    },
    // 获取某个月的最后一天的日期
    getEndDay(year, month) {
      // 注意：这里的月份是几月就传几月，不用+1或者-1
      return new Date(year, month, 0).getDate();
    },
    // 获取某个月的第一天是周几
    getFirstWeek(year, month) {
      return new Date(year, month - 1, 1).getDay();
    },
    // 去除标签
    delTag(str) {
      return str.replace(/<\/?.+?\/?>/g, '');
    },
    // 补0
    repair(v){
      return v < 10 ? '0' + v : v;
    },
    // 渲染日期
    renderDate(d, data) {
      const tBody = document.querySelector('.dateWrap tbody');

      let lastEndDay = this.getEndDay(d.getFullYear(), d.getMonth()); // 上个月的最后一天
      let curEndDay = this.getEndDay(d.getFullYear(), d.getMonth() + 1); // 当前月的最后一天
      let week = this.getFirstWeek(d.getFullYear(), d.getMonth() + 1); // 当前月的第一天是周几

      let lastDateNum = week - 1; // 上个月占几个格子
      // 如果当前月的第一天是周日，那么week的值为0，这时需要给上个月留出6个格子
      lastDateNum = week === 0 ? 6 : lastDateNum;

      let prevStartDate = lastEndDay - lastDateNum; // 上个月的起始日期
      let curStartDate = 1; // 当前月的起始日期
      let nextStartDate = 1; // 下个月的起始日期

      let calendar = document.querySelector('#calendar');
      calendar.classList.remove('active'); // 如果之前已经有添加，要先取消再添加

      tBody.innerHTML = '';
      let cn = -1; // 记录42次循环走的每一次
      // 6行7列
      for (let i = 0; i < 6; i++) { // 这个循环是tr
        let tr = document.createElement('tr');
        let td = '';
        for (let j = 0; j < 7; j++) { // 这个循环是td
          cn++;

          let featival = data[cn].jie ? this.delTag(data[cn].jie) : data[cn].r2; // 节日
          let weekday = data[cn].jia === 90 ? 'weekday' : ''; // 班
          let holiday = data[cn].jia > 90 ? 'holiday' : ''; // 休

          if (cn < lastDateNum) { // 上个月的日期
            td += `<td>
              <div class="prevMonth ${weekday + ' ' + holiday}">
                <span>${++prevStartDate}</span>
                <span>${featival}</span>
              </div>
            </td>`;
          } else if (cn >= lastDateNum + curEndDay) { // 下个月的日期
            td += `<td>
              <div class="nextMonth ${weekday + ' ' + holiday}">
                <span>${nextStartDate++}</span>
                <span>${featival}</span>
              </div>
            </td>`;
          } else { // 当前月的日期
            let cl = '';
            // 格子里的日期与当前日期对象（this.curDate）里的日期进行对比
            if (curStartDate === d.getDate()) {
              cl = 'active';
            }
            // 循环的格子是今天的日期
            if (new Date().getFullYear() === d.getFullYear() && 
              new Date().getMonth() === d.getMonth() && 
              new Date().getDate() === d.getDate() && 
              d.getDate() === curStartDate) {
                cl += ' today';
            }

            td += `<td>
              <div class="${cl + ' ' + weekday + ' ' + holiday}">
                <span>${curStartDate++}</span>
                <span>${featival}</span>
              </div>
            </td>`;

            if(cl.indexOf('active') !== -1 && holiday === 'holiday'){
              // 表示是节假日，最外层的父级需要添加红色的class
              let curDay = this.delTag(data[cn].jie);
              this.holidays.includes(curDay) && calendar.classList.add('active');
              /**
               * 添加红色active的条件：
               * 1.当前的格子必须有active的class，表示激活状态
               * 2.当前的格子必须有holiday的class，表示是个节日
               * 3.节日必须为this.holiday里的某一个
               */
            }
          }

          tr.innerHTML = td;
        }

        tBody.appendChild(tr);
      }

      this.dateBindEvent(data);
    },
    // 切换月份
    monthChange(){
      let arrows = document.querySelectorAll('.arrow');

      // 上个月
      arrows[0].onclick = () => {
        this.curDate.setMonth(this.curDate.getMonth() - 1); // 月份减1
        this.renderSelect(this.curDate); // 渲染下拉框
        this.getData(this.curDate); // 更新日期内容
        this.closeSelect(); // 如果下拉框显示，则让它关闭
      }

      // 下个月
      arrows[1].onclick = () => {
        this.curDate.setMonth(this.curDate.getMonth() + 1); // 月份加1
        this.renderSelect(this.curDate);
        this.getData(this.curDate);
      }
    },
    // 返回今天
    backToday(){
      let returnBtn = document.querySelector('#calendar .topBar button');

      returnBtn.onclick = () => {
        this.curDate = new Date(); // 今天的日期
        this.renderSelect(this.curDate); // 渲染下拉列表
        this.getData(this.curDate); // 更新日期内容
      }
    },
    // 日期点击功能
    dateBindEvent(data){
      let boxes = [...document.querySelectorAll('.dateWrap tbody td div')];
      let last = boxes.find(box => box.classList.contains('active'));

      let curYear = this.curDate.getFullYear(); // 当前年份
      let curMonth = this.curDate.getMonth(); // 当前月份

      boxes.forEach((box, index) => box.onclick = () => {
        let date = box.children[0].innerHTML; // 点击的日期

        // 选项卡
        let cl = box.classList;
        last && last.classList.remove('active');
        cl.add('active');
        last = box;

        this.closeSelect(); // 如果下拉框显示，点击的话需要隐藏

        if(cl.contains('prevMonth')){ // 点击的是上个月
          this.curDate = new Date(curYear, curMonth - 1, date); // 同时设置年月日
          this.renderSelect(this.curDate);
          this.getData(this.curDate);
        }else if(cl.contains('nextMonth')){ // 点击的是下个月
          this.curDate = new Date(curYear, curMonth + 1, date);
          this.renderSelect(this.curDate);
          this.getData(this.curDate);
        }else{ // 点击的是当前月
          let calendar = document.querySelector('#calendar');
          let curDay = box.children[1].innerHTML;
    
          calendar.className = this.holidays.includes(curDay) ? 'active' : '';
          this.renderLunar(data[index]);
        }
      })
    },
    // 渲染农历
    renderLunar(data){
      let date = document.querySelector('.right .date');
      let day = document.querySelector('.right .day');
      let ps = document.querySelectorAll('.right .lunar p');
      let holidayList = document.querySelector('.right .holidayList');

      date.innerHTML = data.nian + '-' + this.repair(data.yue) + '-' + this.repair(data.ri);
      day.innerHTML = data.ri;
      ps[0].innerHTML = data.n_yueri;
      ps[1].innerHTML = data.gz_nian + '年 ' + data.shengxiao;
      ps[2].innerHTML = data.gz_yue + '月 ' + data.gz_ri;
      // 节日
      let holidays = this.delTag(data.jieri).split(',');
      holidays = holidays.length > 2 ? holidays.slice(0, 2) : holidays;
      holidayList.innerHTML = '';
      holidays.forEach(holiday => holidayList.innerHTML += `<li>${holiday}</li>`);
      
      // 宜忌
      // default对应的结构
      let defaultDl = document.querySelectorAll('.suit .default dl');

      defaultDl[0].innerHTML = '<dt>宜</dt>';
      data.yi.forEach(yi => defaultDl[0].innerHTML += `<dd>${yi}</dd>`);

      defaultDl[1].innerHTML = '<dt>忌</dt>';
      data.ji.forEach(ji => defaultDl[1].innerHTML += `<dd>${ji}</dd>`);

      // hover对应的结构
      let hoverDl = document.querySelectorAll('.suit .hover dl');

      let yiStr = '';
      data.yi.forEach(yi => yiStr += `${yi}、`);
      hoverDl[0].innerHTML = '<dt>宜</dt><dd>' + yiStr.substring(0, yiStr.length -1) + '</dd>';

      let jiStr = '';
      data.ji.forEach(ji => jiStr += `${ji}、`);
      hoverDl[1].innerHTML = '<dt>忌</dt><dd>' + jiStr.substring(0, jiStr.length -1) + '</dd>';
    }
  }
  calendar.init();
})();
