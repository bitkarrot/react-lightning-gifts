// NPM Dependencies
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import QRCode from 'qrcode.react';

// UI Dependencies
import { Button, Form, InputNumber, Spin, Icon, Input } from 'antd';

// Util Dependencies
import Emoji from 'utils/components/emoji';

// Local Dependencies
import { redeemGiftSignal } from '../actions';

class RedeemForm extends Component {
    static propTypes = {
        form: PropTypes.shape({
            getFieldDecorator: PropTypes.func.isRequired,
            validateFields: PropTypes.func.isRequired
        }).isRequired,
        redeemGift: PropTypes.func.isRequired
        // history: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false
        };
    }

    // componentDidUpdate = (prevProps) => {
    //     if (this.props.invoiceStatus !== prevProps.invoiceStatus) {
    //         this.setState({
    //             loading: false
    //         });
    //     }
    // };

    handleSubmit = (e) => {
        e.preventDefault();
        const { form, redeemGift } = this.props;

        form.validateFields((err, values) => {
            if (!err) {
                const { amount } = values;

                redeemGift({ amount });

                this.setState({
                    loading: true
                });
            }
        });
    };

    validateAmount = (rule, value, callback) => {
        if (!_.isNumber(value)) {
            callback('Please enter numbers only');
        } else if (value < 1) {
            callback('Negative values not supported');
        } else if (value % 1 !== 0) {
            callback('Decimals not supported');
        } else if (value > 100000) {
            callback('Only gifts under 100,000 sats supported in beta');
        } else {
            callback();
        }
    };

    render() {
        const { loading } = this.state;
        const { getFieldDecorator } = this.props.form;

        if (loading) {
            return (
                <div style={{ textAlign: 'center' }}>
                    <Spin tip="loading..." size="large" />
                </div>
            );
        }

        if (!_.isEmpty(invoiceStatus)) {
            const {
                lightning_invoice: lightningInvoice, amount, status, order_id: orderId
            } = invoiceStatus;

            if (status === 'paid') {
                return (
                    <Fragment>
                        <p><Emoji label="confeti" symbol="🎊️" /> <b>Payment received!</b> <Emoji label="confeti" symbol="🎊️" /></p>
                        <p>
                            <Link to={`redeem/${orderId}`}>View your redeemable Bitcoin gift</Link>
                        </p>
                    </Fragment>
                );
            }

            return (
                <Fragment>
                    <p>Pay Bolt-11 invoice with a Lightning compatible wallet to complete your gift card <Emoji label="point-down" symbol="👇️" /></p>
                    <QRCode
                        value={lightningInvoice.payreq}
                        size={128}
                    />
                    <p><b>{amount} sats</b></p>
                    <Input addonAfter={<Icon type="copy" />} value={lightningInvoice.payreq} />
                </Fragment>
            );
        }

        return (
            <Fragment>
                <Form onSubmit={this.handleSubmit} layout="vertical" hideRequiredMark style={{ textAlign: 'center' }}>
                    <Form.Item>
                        {getFieldDecorator('amount', {
                            rules: [{ validator: this.validateAmount }]
                        })(
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Gift amount (satoshi)"
                                size="large"
                                addonAfter="sats"
                                min={1}
                            />
                        )}
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" size="large" style={{ width: '100%' }} htmlType="submit">
                            Create
                        </Button>
                    </Form.Item>
                </Form>
                <small>A Bolt-11 invoice will be generated</small>
            </Fragment>
        );
    }
}

const mapDispatchToProps = dispatch =>
    bindActionCreators({
        redeemGift: redeemGiftSignal.request
    }, dispatch);


const WrappedRedeemForm = Form.create()(RedeemForm);

export default connect(mapStateToProps, mapDispatchToProps)(WrappedRedeemForm);