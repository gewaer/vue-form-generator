<template>
    <textarea
        :id="item.label | slugify | lowercase"
        v-model="value"
        v-bind="attributes"
        :name="item.label | slugify | lowercase"
        :data-vv-name="item.label"
        :minlength="minLength"
        :maxlength="maxLength"
        v-on="item.events || {}"
        @input="updateValue"
        @change="updateValue"
        @blur="updateValue"
    />
</template>

<script>
import fieldsMixin from "../mixins";

export default {
    name: "Textarea",
    mixins: [
        fieldsMixin
    ],
    data() {
        return {
            DEFAULT_MAX_LENGTH_TEXTAREA: 32000,
            value: undefined
        }
    },
    computed: {
        minLength() {
            return !this.isInputNumber && !this.hasPattern && this.item.validations && this.item.validations.min || undefined;
        },
        maxLength() {
            return !this.isInputNumber && !this.hasPattern && this.item.validations ? this.item.validations.max || this.DEFAULT_MAX_LENGTH_TEXTAREA : undefined;
        }
    },
    mounted() {
        this.value = this.item.value;
    }
}
</script>
