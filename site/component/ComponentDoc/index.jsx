import React from 'react';
import { Row, Col, Button, Icon, Popover } from 'antd';
import Demo from '../Demo';
import DemoPreview from '../DemoPreview';
import * as utils from '../utils';
import demosList from '../../../_data/demos-list';

import QRCode from 'qrcode.react';

export default class ComponentDoc extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expandAll: false,
      currentIndex: 0,
      // 收起展开代码的存储数组
      codeExpandList: [],
    };
  }

  componentWillReceiveProps() {
    this.setState({
      currentIndex: 0,
    });
  }

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollEvent);
    this.componentDidUpdate();
  }
  componentDidUpdate() {
    const { chinese, english } = this.props.doc.meta;
    utils.setTitle(`${chinese} ${english} - Ant Design`);
  }

  // 用于控制内部代码的展开和收起
  handleCodeExpandList = (index, type) => {
    let codeExpandList = { ...this.state.codeExpandList };
    codeExpandList[index] = type;

    this.setState({
      codeExpandList: codeExpandList
    });
  }

  handleExpandToggle = () => {
    this.setState({
      expandAll: !this.state.expandAll,
    });
  }

  togglePreview = (e) => {
    this.setState({
      currentIndex: e.index,
    });
  }

  nextPreview = () => {
    this.setState({
      currentIndex: this.state.currentIndex + 1,
    });
  }

  prePreview = () => {
    this.setState({
      currentIndex: this.state.currentIndex - 1,
    });
  }

  onScrollEvent() {
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    const apiTop = document.getElementById('api').offsetTop;

    const asideDemo = document.getElementById('aside-demo');

    if (scrollTop >= apiTop - 500) {
      if (asideDemo.className.indexOf('fixed') >= 0) {
        asideDemo.className = asideDemo.className.replace(/fixed/ig, '');
      }
    } else if (asideDemo.className.indexOf('fixed') < 0) {
      asideDemo.className += ' fixed';
    }
  }
  render() {
    const { doc, location } = this.props;
    const { description, meta } = doc;

    const demoUrl = `http://beta.antm.alipay.net/kitchen-sink.html#/${meta.english.toLowerCase().replace(/\s+/g, '')}`;

    const PopoverContent = (<div>
      <h4 style={{ margin: '8px 0 12px' }}>扫二维码查看演示效果</h4>
      <QRCode size={ 144 } value={ demoUrl } />
    </div>);

    const demos = (demosList[meta.fileName] || [])
            .filter((demoData) => !demoData.meta.hidden);
    const expand = this.state.expandAll;
    const currentIndex = this.state.currentIndex;

    const leftChildren = [];
    const rightChildren = [];

    const demoSort = demos.sort((a, b) => {
      return parseInt(a.meta.order, 10) - parseInt(b.meta.order, 10);
    });

    const demoTitle = demoSort[currentIndex].meta.title;

    demoSort.forEach((demoData, index) => {
      demoData.index = index;

      leftChildren.push(
        <Demo togglePreview={ this.togglePreview } {...demoData} handleCodeExpandList={this.handleCodeExpandList} codeExpand={this.state.codeExpandList[index]} className={index === currentIndex ? 'code-box-target' : ''}
          key={index}
          expand={expand} pathname={location.pathname} />
      );

      rightChildren.push(
        <DemoPreview {...demoData} className={index === currentIndex ? 'show' : 'hide'}
          key={ `preview-${index}` } />
      );
    });

    return (
      <article>
        <Row style ={{ minHeight: '830px' }}>
          <Col span="13" style={{ width: '54%', paddingRight: '16px' }}>
            <section className="markdown">
              <h1 className="section-title">
                {meta.chinese || meta.english}
                  <Popover content={ PopoverContent } placement="bottom">
                    <Icon style={{ position: 'relative', left: '8px', top: '-1px', fontSize: '24px' }} type="qrcode" />
                  </Popover>
              </h1>
              {
                utils.jsonmlToComponent(
                location.pathname,
                ['section', { className: 'markdown' }]
                .concat(description)
                )
              }
              <h2>
                代码演示
              </h2>
            </section>
            { leftChildren }
            <Row>
              <Col span="12" style={{ paddingRight: '8px' }}>
                <Button style={{ width: '100%' }}
                  type="ghost"
                  disabled = { currentIndex === 0 }
                  onClick = { this.prePreview } >
                  <Icon type="up" />
                </Button>
              </Col>
              <Col span="12" style={{ paddingLeft: '8px' }}>
                <Button style={{ width: '100%' }}
                  type="ghost"
                  disabled = { currentIndex >= demos.length - 1 }
                  onClick = { this.nextPreview } >
                  <Icon type="down" />
                </Button>
              </Col>
            </Row>
          </Col>
          <Col span="11">
            <div id="aside-demo" className="aside-demo fixed">
              <div style = {{ width: '395px', height: '818px', paddingTop: '99px', background: 'url("https://os.alipayobjects.com/rmsportal/XdawWiuviSMdHNn.png") no-repeat', backgroundSize: '100%' }}>
                <div className="demo-preview-wrapper">
                  <div className="demo-preview-header">
                    <div className = "demo-preview-statbar">
                      <img width="340px" style={{ margin: '0 2px' }} src="https://os.alipayobjects.com/rmsportal/VfVHYcSUxreetec.png" />
                    </div>
                    <div className = "demo-preview-navbar">
                      <span style={{ color: '#fff', fontSize: '18px', lineHeight: '44px' }}>{ demoTitle }</span>
                    </div>
                  </div>
                  <div className="demo-preview-scroller">
                  { rightChildren }
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {
          utils.jsonmlToComponent(
          location.pathname,
          ['section', {
            id: 'api',
            className: 'markdown api-container',
          }].concat(doc.api || [])
          )
        }

      </article>
    );
  }
}
