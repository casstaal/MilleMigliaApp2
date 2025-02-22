<script setup lang="ts">
    import { ref, computed, watch } from "vue";

    defineProps<{ isVisible: boolean }>();
    defineEmits(["close"]);

    interface Step {
        title: string;
        description: string;
        type: "text" | "file" | "date";
        placeholder?: string;
    }

    const steps = ref<Step[]>([
        { title: "Step 1: Brand", description: "Enter the brand of the car.", type: "text", placeholder: "e.g. Toyota" },
        { title: "Step 2: Model", description: "Enter the model name.", type: "text", placeholder: "e.g. Corolla" },
        { title: "Step 3: Description", description: "Provide a description.", type: "text", placeholder: "e.g. Red sedan" },
        { title: "Step 4: Images", description: "Upload images of the car.", type: "file" },
        { title: "Step 5: Location", description: "Confirm latitude and longitude.", type: "text", placeholder: "e.g. 37.7749, -122.4194" },
        { title: "Step 6: Date", description: "Select the date.", type: "date" }
    ]);

    const currentStep = ref<number>(0);
    const formValues = ref<Record<number, string>>({});
    const isValid = ref<boolean>(false);
    const isHighlighted = ref<boolean>(true);

    const currentTitle = computed((): string => steps.value[currentStep.value]?.title || "");
    const currentDescription = computed((): string => steps.value[currentStep.value]?.description || "");
    const currentPlaceholder = computed((): string => steps.value[currentStep.value]?.placeholder || "");
    const currentStepType = computed((): string => steps.value[currentStep.value]?.type || "");

    watch(() => formValues.value[currentStep.value], (newVal) => {
        isValid.value = !!(newVal && newVal.trim().length > 0);
    });

    const validateInput = () => {
        isValid.value = !!(formValues.value[currentStep.value] && formValues.value[currentStep.value]?.trim().length > 0);
    };

    const nextStep = () => {
        if (isValid.value) {
            currentStep.value++;
            isHighlighted.value = true;
        }
    };

    const prevStep = () => {
        if (currentStep.value > 0) {
            currentStep.value--;
            isHighlighted.value = true;
        }
    };
</script>

<template>
    <div v-if="isVisible" class="modal-overlay">
      <div class="modal-content">
        <h2 class="text-dark">{{ currentTitle }}</h2>
        <p class="text-dark">{{ currentDescription }}</p>
        <input 
          v-if="currentStepType === 'text'" 
          v-model="formValues[currentStep]" 
          @input="validateInput" 
          class="input-field"
          :class="{ highlighted: isHighlighted }"
          :placeholder="currentPlaceholder"
        />
  
        <button v-if="currentStep > 0" @click="prevStep">Previous</button>
        <button v-if="currentStep < steps.length - 1" :disabled="!isValid" @click="nextStep">Next</button>
        <button v-if="currentStep === steps.length - 1" @click="$emit('close')">Finish</button>
      </div>
    </div>
  </template>
  
  <style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
  
  .input-field {
    display: block;
    margin: 10px auto;
    padding: 10px;
    border: 2px solid gray;
    border-radius: 5px;
  }
  
  .input-field.highlighted {
    border-color: blue;
    box-shadow: 0 0 5px blue;
  }
  
  button:disabled {
    background: gray;
    cursor: not-allowed;
  }
  </style>
  