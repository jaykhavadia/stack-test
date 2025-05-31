import React, { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi";

import { Job } from "../types";

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobToEdit: Job | null;
  token: string;
}

const initialFormState = {
  title: "",
  company: "",
  location: "",
  type: "",
  salary: "",
  description: "",
  requirements: [""],
  category: "",
};

function JobModal({
  isOpen,
  onClose,
  onSuccess,
  jobToEdit,
  token,
}: JobModalProps) {
  const { callApi, loading, error } = useApi();
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        title: jobToEdit.title || "",
        company: jobToEdit.company || "",
        location: jobToEdit.location || "",
        type: jobToEdit.type || "",
        salary: jobToEdit.salary || "",
        description: jobToEdit.description || "",
        requirements:
          jobToEdit.requirements && jobToEdit.requirements.length > 0
            ? jobToEdit.requirements
            : [""],
        category: jobToEdit.category || "",
      });
    } else {
      setFormData(initialFormState);
      setFormErrors({});
    }
  }, [jobToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.company.trim()) errors.company = "Company is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.type.trim()) errors.type = "Type is required";
    if (!formData.salary.trim()) errors.salary = "Salary is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.category.trim()) errors.category = "Category is required";
    if (
      !formData.requirements ||
      formData.requirements.length === 0 ||
      formData.requirements.some((r) => !r.trim())
    ) {
      errors.requirements = "At least one requirement is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;
    if (name === "requirements" && typeof index === "number") {
      const newRequirements = [...formData.requirements];
      newRequirements[index] = value;
      setFormData({ ...formData, requirements: newRequirements });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addRequirement = () => {
    setFormData({ ...formData, requirements: [...formData.requirements, ""] });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const apiEndpoint = jobToEdit ? `/api/jobs/${jobToEdit._id}` : "/api/jobs";
    const method = jobToEdit ? "PUT" : "POST";

    const response = await callApi(apiEndpoint, {
      method,
      body: formData,
      token,
    });

    if (!response.error) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-900">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          {jobToEdit ? "Update Job" : "Create Job"}
        </h2>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {[
            { id: "title", label: "Title" },
            { id: "company", label: "Company" },
            { id: "location", label: "Location" },
            { id: "type", label: "Type" },
            { id: "salary", label: "Salary" },
            { id: "category", label: "Category" },
          ].map(({ id, label }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {label}
              </label>
              <input
                id={id}
                name={id}
                type="text"
                value={formData[id]}
                onChange={handleChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                className={`w-full rounded-xl border px-4 py-2 text-sm text-gray-800 dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition focus:ring-2 ${
                  formErrors[id]
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
              {formErrors[id] && (
                <p className="mt-1 text-xs text-red-500">{formErrors[id]}</p>
              )}
            </div>
          ))}

          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Job description..."
              className={`w-full rounded-xl border px-4 py-2 text-sm text-gray-800 dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition focus:ring-2 ${
                formErrors.description
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {formErrors.description && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.description}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Requirements
            </label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <input
                  type="text"
                  name="requirements"
                  value={req}
                  onChange={(e) => handleChange(e, index)}
                  placeholder="Enter requirement"
                  className={`flex-1 rounded-xl border px-4 py-2 text-sm text-gray-800 dark:text-white dark:bg-gray-800 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none transition focus:ring-2 ${
                    formErrors.requirements
                      ? "border-red-500 focus:ring-red-400"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Add Requirement
            </button>
            {formErrors.requirements && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.requirements}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFormErrors({});
                onClose();
              }}
              className="rounded-xl bg-gray-300 px-5 py-2 text-sm text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : jobToEdit ? "Update" : "Create"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-red-500">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default JobModal;
