import './index.scss'
import React, { useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import {loginUser, registerUser} from "@/store/modules/authStore.tsx";
import {AppDispatch} from "@/store";
import {Button} from "antd";
import {useNavigate} from "react-router-dom";

const Login = () => {
    const [LoginOrRegister, setLoginOrRegister] = useState(1);
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const { loading } = useSelector(state => state.auth)

    // 处理输入框变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // 切换登录/注册，并清空输入框
    const toggleLoginRegister = (mode: number) => {
        setLoginOrRegister(mode);
        setForm({ email: '', password: '' }); // 清空输入框
    };

    const navigate = useNavigate()

    const dispatch = useDispatch<AppDispatch>();
    const handleUserRegister = async () => {
        const res = await dispatch(registerUser(form));
        if (res) {
            toggleLoginRegister(1)
        }
    };
    const handleUserLogin = async () => {
        const res = await dispatch(loginUser(form));
        if (res) {
            navigate("/")
        }
    };
    return (
        <div className={'All'}>
            {/* 左上角logo */}
            <div className={'LogoBox'}>CollaStudio</div>

            {/* 登录框 */}
            <div className={'MiddleBox'}>
                {/* 标题 */}
                <div className={'Titile'}>
                    {LoginOrRegister ? "Login" : "Register"}
                </div>

                <div className={'InputBox'}>
                    <div className={'InputTitle'}>email</div>
                    <input
                        type="text"
                        className={'Input'}
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>
                <div className={'InputBox'}>
                    <div className={'InputTitle'}>password</div>
                    <input
                        type="password"
                        className={'Input'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                { LoginOrRegister ?
                    <Button
                        color="default"
                        className={'SubmitButton'}
                        variant="solid"
                        loading={loading}
                        onClick={handleUserLogin}
                    >
                        Log in
                    </Button>

                    :
                    <Button
                        color="default"
                        className={'SubmitButton'}
                        variant="solid"
                        loading={loading}
                        onClick={handleUserRegister}
                    >
                        Create account
                    </Button> }



                <div className={'BottomText'}>
                    {LoginOrRegister ? (
                            <Button
                                color="primary"
                                variant="link"
                                onClick={() => toggleLoginRegister(0)}
                            >
                                Register
                            </Button>
                    ) : (
                        <>
                            Already have an account?
                            <Button
                                color="primary"
                                variant="link"
                                onClick={() => toggleLoginRegister(1)}
                            >
                                Log in
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
