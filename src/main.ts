import './assets/main.css'

import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'
import App from './App.vue'
import router from './router'
import { definePreset } from '@primeuix/themes';
import { Button, InputText, Menubar, Ripple, Toast, ToastService, Avatar, Menu, Badge, Card, Dialog, InputNumber, Textarea, DataTable, Column, AnimateOnScroll } from 'primevue';
import VueKonva from 'vue-konva'

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: definePreset(Aura, {
            semantic: {
                primary: {
                    50: '{pink.50}',
                    100: '{pink.100}',
                    200: '{pink.200}',
                    300: '{pink.300}',
                    400: '{pink.400}',
                    500: '{pink.500}',
                    600: '{pink.600}',
                    700: '{pink.700}',
                    800: '{pink.800}',
                    900: '{pink.900}',
                    950: '{pink.950}'
                }
            }
        }),
        darkModeSelector: '.dark',
        cssLayer: {
            name: 'primevue',
            order: 'ovv, primevue, novv'
        },
    },
    zIndex: {
        toast: 1000,
    }
});
app.use(router)
app.use(ToastService)
app.use(VueKonva)
app.mount('#app')
app.directive('ripple', Ripple)
app.directive('animateonscroll', AnimateOnScroll)
app.component('Menubar', Menubar)
app.component('Button', Button)
app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Toast', Toast)
app.component('Avatar', Avatar)
app.component('Menu', Menu)
app.component('Badge', Badge)
app.component('Card', Card)
app.component('Dialog', Dialog)
app.component('Textarea', Textarea)
app.component('DataTable', DataTable)
app.component('Column', Column)