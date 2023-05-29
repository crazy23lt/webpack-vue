<template>
	<div class="login-container">
		<a-row>
			<a-col :xs="0" :md="0" :sm="12" :lg="14" :xl="16"></a-col>
			<a-col :xs="24" :sm="24" :md="12" :lg="10" :xl="6">
				<div class="login-container-form">
					<div class="login-container-hello">hello!</div>
					<div class="login-container-title">欢迎来到 {{ title }}</div>
					<a-form-model
						:model="form"
						@submit="handleSubmit"
						@submit.native.prevent
					>
						<a-form-model-item>
							<a-input v-model="form.user" placeholder="Username">
								<a-icon
									slot="prefix"
									type="user"
									style="color: rgba(0, 0, 0, 0.25)"
								/>
							</a-input>
						</a-form-model-item>
						<a-form-model-item>
							<a-input
								v-model="form.password"
								type="password"
								placeholder="Password"
							>
								<a-icon
									slot="prefix"
									type="lock"
									style="color: rgba(0, 0, 0, 0.25)"
								/>
							</a-input>
						</a-form-model-item>
						<a-form-model-item>
							<a-button
								type="primary"
								html-type="submit"
								:disabled="form.user === '' || form.password === ''"
							>
								登录
							</a-button>
						</a-form-model-item>
					</a-form-model>
				</div>
			</a-col>
		</a-row>
	</div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { login } from "api/auth";
export default {
	data() {
		return {
			form: {
				user: "2394630102@qq.com",
				password: 123456789
			}
		};
	},
	computed: {
		...mapGetters({
			title: "app/newTitle"
		})
	},
	methods: {
		...mapActions({
			setToken: "app/setToken"
		}),
		handleSubmit() {
			login(this.form).then(({ data }) => {
				this.setToken(data.token);
				this.$router.push("/");
			});
		}
	}
};
</script>

<style lang="scss">
.login-container {
	height: 100vh;
	background: url("assets/login_images/login_background.png");
	background-size: cover;
	&-form {
		width: calc(100% - 40px);
		height: 380px;
		padding: 4vh;
		margin-top: calc((100vh - 380px) / 2);
		margin-right: 20px;
		margin-left: 20px;
		background: url("assets/login_images/login_form.png");
		background-size: 100% 100%;
		border-radius: 10px;
		box-shadow: 0 2px 8px 0 rgba(7, 17, 27, 0.06);
	}
	&-hello {
		font-size: 32px;
		color: #fff;
	}
	&-title {
		margin-bottom: 30px;
		font-size: 20px;
		color: #fff;
	}
	.ant-col {
		padding: 0 10px 0 10px;
	}
	.ant-input {
		height: 35px;
	}
	.ant-btn {
		width: 100%;
		height: 45px;
		border-radius: 99px;
	}
}
</style>
