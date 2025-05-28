import xlrd
import tkinter as tk
from tkinter import filedialog, messagebox
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class ExcelApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Distribution Generator")
        
        self.data = None
        
        # 左侧框架
        self.left_frame = tk.Frame(root)
        self.left_frame.pack(side=tk.LEFT, fill=tk.Y, padx=10, pady=5)

        # 创建一个用于放置 Listbox 的新框架，这样滚动条就可以放在 Listbox 的旁边了
        self.listbox_frame = tk.Frame(self.left_frame)
        self.listbox_frame.pack(fill=tk.BOTH, expand=True)
        
        # 顶部框架，用于放置按钮和标签
        self.top_frame = tk.Frame(self.left_frame)
        self.top_frame.pack(side=tk.TOP, fill=tk.X, pady=0)

        # 文件上传按钮
        self.upload_btn = tk.Button(self.top_frame, text="Upload Excel", command=self.upload_file)
        self.upload_btn.pack(anchor=tk.N, fill=tk.X, pady=5)

        # # 数据展示标签
        # self.data_label = tk.Label(self.top_frame, text="Raw Data")
        # self.data_label.pack(anchor=tk.N, fill=tk.X, pady=(10, 5))

        # 数据展示区域
        self.data_listbox = tk.Listbox(self.listbox_frame, height=15, width=10)
        self.data_listbox.pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        
        # 获取 Listbox 的尺寸信息
        listbox_width = self.data_listbox.winfo_width()
        listbox_height = self.data_listbox.winfo_height()
        listbox_x = self.data_listbox.winfo_x()
        listbox_y = self.data_listbox.winfo_y()

        # 垂直滚动条
        self.vbar = tk.Scrollbar(self.left_frame, orient="vertical")
        self.vbar.place(x=listbox_x + listbox_width - 15, y=listbox_y, height=listbox_height)
        self.vbar.pack(side=tk.RIGHT, fill='y')

        # 水平滚动条
        self.hbar = tk.Scrollbar(self.left_frame, orient="horizontal")
        self.hbar.place(x=listbox_x, y=listbox_y + listbox_height - 15, width=listbox_width)

        # 将滚动条与 Listbox 关联
        self.data_listbox.config(yscrollcommand=self.vbar.set)
        self.data_listbox.config(xscrollcommand=self.hbar.set)

        # 将滚动条的滚动事件传递给 Listbox
        self.vbar.config(command=self.data_listbox.yview)
        self.hbar.config(command=self.data_listbox.xview)

        # 使滚动条在 Listbox 更新大小时重新定位
        self.data_listbox.bind('<Configure>', self.on_listbox_resize)

        
        # 按钮框架
        self.button_frame = tk.Frame(self.left_frame)
        self.button_frame.pack(pady=5)
        
        # 直方图绘制按钮
        self.plot_hist_btn = tk.Button(self.button_frame, text="Plot Histogram", command=self.plot_histogram)
        self.plot_hist_btn.grid(row=0, column=0, sticky="W", padx=5)
        
        # 密度图绘制按钮
        self.plot_density_btn = tk.Button(self.button_frame, text="Plot Density", command=self.plot_density)
        self.plot_density_btn.grid(row=0, column=1, sticky="W", padx=5)
        
        # 直方图滑块和输入框初始化
        self.bin_label = tk.Label(self.button_frame, text="Bin Step:")
        self.bin_slider = tk.Scale(self.button_frame, from_=0.1, to=100, orient=tk.HORIZONTAL, resolution=0.1, command=self.update_bin_step)
        self.bin_step_entry = tk.Entry(self.button_frame, width=10)
        
        self.hist_xmin_label = tk.Label(self.button_frame, text="X Min:")
        self.hist_xmin_entry = tk.Entry(self.button_frame, width=10)
        self.hist_xmax_label = tk.Label(self.button_frame, text="X Max:")
        self.hist_xmax_entry = tk.Entry(self.button_frame, width=10)
        self.hist_xmin_slider = tk.Scale(self.button_frame, from_=0, to=100, orient=tk.HORIZONTAL, resolution=0.01, command=self.update_histogram)
        self.hist_xmax_slider = tk.Scale(self.button_frame, from_=0, to=100, orient=tk.HORIZONTAL, resolution=0.01, command=self.update_histogram)
        
        # 密度图滑块和输入框初始化
        self.dens_xmin_label = tk.Label(self.button_frame, text="X Min:")
        self.dens_xmin_entry = tk.Entry(self.button_frame, width=10)
        self.dens_xmax_label = tk.Label(self.button_frame, text="X Max:")
        self.dens_xmax_entry = tk.Entry(self.button_frame, width=10)
        self.dens_xmin_slider = tk.Scale(self.button_frame, from_=0, to=100, orient=tk.HORIZONTAL, resolution=0.01, command=self.update_density_from_slider)
        self.dens_xmax_slider = tk.Scale(self.button_frame, from_=0, to=100, orient=tk.HORIZONTAL, resolution=0.01, command=self.update_density_from_slider)
        
        # 右侧框架
        self.right_frame = tk.Frame(root)
        self.right_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.hist_canvas = None
        self.density_canvas = None
    
    def on_listbox_resize(self, event):
        # 重新定位滚动条
        listbox_width = event.width
        listbox_height = event.height
        self.vbar.place(x=event.x + listbox_width - 15, y=event.y, height=listbox_height)
        self.hbar.place(x=event.x, y=event.y + listbox_height - 15, width=listbox_width)
    

    def upload_file(self):
        file_path = filedialog.askopenfilename()
        if file_path:
            try:
                # 读取Excel文件
                df = pd.read_excel(file_path)
                
                # 只保留第一列数据
                column_data = df.iloc[:, 0]

                # 将非数字值转换为NaN
                numeric_data = pd.to_numeric(column_data, errors='coerce')

                # 删除NaN值（即非数字行）
                self.data = numeric_data.dropna().tolist()

                # 更新Listbox
                self.data_listbox.delete(0, tk.END)
                for item in self.data:
                    self.data_listbox.insert(tk.END, item)

                # 重置bin_slider和bin_step_entry
                self.bin_slider.set(1)  # 默认 bin step 值
                self.bin_step_entry.delete(0, tk.END)
                self.bin_step_entry.insert(0, "1")

            except Exception as e:
                messagebox.showerror("Error", f"Could not read file: {e}")



    
    def update_bin_step(self, val):
        # 更新步长输入框中的值
        self.bin_step_entry.delete(0, tk.END)
        self.bin_step_entry.insert(0, val)
        self.update_histogram(None)

    def plot_histogram(self):
        if self.data:
            self.bin_label.grid(row=3, column=0, sticky="W", padx=5)
            self.bin_slider.grid(row=4, column=0, padx=5, sticky="W", columnspan=1)
            self.bin_step_entry.grid(row=3, column=0, sticky="W", padx=60)
            self.hist_xmin_label.grid(row=6, column=0, sticky="W", padx=5)
            self.hist_xmin_entry.grid(row=6, column=0, sticky="W", padx=60)
            self.hist_xmin_slider.grid(row=7, column=0, columnspan=1, sticky="W", padx=5)
            
            self.hist_xmax_label.grid(row=9, column=0, sticky="W", padx=5)
            self.hist_xmax_entry.grid(row=9, column=0, sticky="W", padx=60)
            self.hist_xmax_slider.grid(row=10, column=0, columnspan=1, sticky="W", padx=5)
            
            self.hist_xmin_entry.bind('<Return>', lambda event: self.update_slider_from_entry(self.hist_xmin_entry, self.hist_xmin_slider))
            self.hist_xmax_entry.bind('<Return>', lambda event: self.update_slider_from_entry(self.hist_xmax_entry, self.hist_xmax_slider))
            
            self.hist_xmin_slider.config(from_=min(self.data), to=max(self.data))
            self.hist_xmax_slider.config(from_=min(self.data), to=max(self.data))
            
            self.update_histogram(None, init=True)
    
    def update_histogram(self, val, init=False):
        if self.data:
            try:
                bin_step = float(self.bin_step_entry.get())
            except ValueError:
                bin_step = self.bin_slider.get()

            xmin = self.hist_xmin_slider.get() if self.hist_xmin_slider else min(self.data)
            xmax = self.hist_xmax_slider.get() if self.hist_xmax_slider else max(self.data)
            if init:
                self.hist_xmin_slider.set(min(self.data))
                self.hist_xmax_slider.set(max(self.data))
                xmin = min(self.data)
                xmax = max(self.data)
            self.hist_xmin_entry.delete(0, tk.END)
            self.hist_xmin_entry.insert(0, str(xmin))
            self.hist_xmax_entry.delete(0, tk.END)
            self.hist_xmax_entry.insert(0, str(xmax))
            if xmin < xmax:
                bins = int((max(self.data) - min(self.data)) / bin_step)
                fig, ax = plt.subplots()
                sns.histplot(self.data, bins=bins, kde=False, ax=ax)
                ax.axvspan(xmin, xmax, color='yellow', alpha=0.3)
                total_count = len(self.data)
                selected_count = sum((pd.Series(self.data) >= xmin) & (pd.Series(self.data) <= xmax))
                probability = selected_count / total_count
                ax.text((xmin + xmax) / 2, ax.get_ylim()[1] * 0.5, f"Probability: {probability:.2f}", horizontalalignment='center', color='black', fontsize=12)
                self.update_plot_x_limits(ax)
                self.show_plot(fig, "histogram")
                plt.close(fig)  # 关闭当前图形以防止内存泄漏
    
    def plot_density(self):
        if self.data:
            self.dens_xmin_label.grid(row=6, column=1, sticky="W", padx=5)
            self.dens_xmin_entry.grid(row=6, column=1, sticky="W", padx=60)
            self.dens_xmin_slider.grid(row=7, column=1, sticky="W", columnspan=1, padx=5)
            
            self.dens_xmax_label.grid(row=9, column=1, sticky="W", padx=5)
            self.dens_xmax_entry.grid(row=9, column=1, sticky="W", padx=60)
            self.dens_xmax_slider.grid(row=10, column=1, sticky="W", columnspan=1, padx=5)
            
            self.dens_xmin_entry.bind('<Return>', lambda event: self.update_slider_from_entry(self.dens_xmin_entry, self.dens_xmin_slider))
            self.dens_xmax_entry.bind('<Return>', lambda event: self.update_slider_from_entry(self.dens_xmax_entry, self.dens_xmax_slider))
            
            self.dens_xmin_slider.config(from_=min(self.data), to=max(self.data))
            self.dens_xmax_slider.config(from_=min(self.data), to=max(self.data))
            
            self.update_density_from_slider(None, init=True)
    
    def update_density_from_slider(self, val, init=False):
        if self.data:
            xmin = self.dens_xmin_slider.get() if self.dens_xmin_slider else min(self.data)
            xmax = self.dens_xmax_slider.get() if self.dens_xmax_slider else max(self.data)
            if init:
                self.dens_xmin_slider.set(min(self.data))
                self.dens_xmax_slider.set(max(self.data))
                xmin = min(self.data)
                xmax = max(self.data)
            self.dens_xmin_entry.delete(0, tk.END)
            self.dens_xmin_entry.insert(0, str(xmin))
            self.dens_xmax_entry.delete(0, tk.END)
            self.dens_xmax_entry.insert(0, str(xmax))
            if xmin < xmax:
                fig, ax = plt.subplots()
                sns.kdeplot(self.data, fill=True, ax=ax)
                ax.axvspan(xmin, xmax, color='yellow', alpha=0.3)
                total_count = len(self.data)
                selected_count = sum((pd.Series(self.data) >= xmin) & (pd.Series(self.data) <= xmax))
                probability = selected_count / total_count
                ax.text((xmin + xmax) / 2, ax.get_ylim()[1] * 0.5, f"Probability: {probability:.2f}", horizontalalignment='center', color='black', fontsize=12)
                self.update_plot_x_limits(ax)
                self.show_plot(fig, "density")
                plt.close(fig)  # 关闭当前图形以防止内存泄漏
    
    def update_slider_from_entry(self, entry, slider):
        try:
            value = float(entry.get())
            slider.set(value)
            if slider == self.hist_xmin_slider or slider == self.hist_xmax_slider:
                self.update_histogram(None)
            else:
                self.update_density_from_slider(None)
        except ValueError:
            messagebox.showerror("Error", "Invalid value entered")
    
    def update_plot_x_limits(self, ax):
        min_xlim = min(self.data)
        max_xlim = max(self.data)
        ax.set_xlim(min_xlim, max_xlim)
    
    def show_plot(self, fig, plot_type):
        if plot_type == "histogram":
            if self.hist_canvas:
                self.hist_canvas.get_tk_widget().destroy()
            self.hist_canvas = FigureCanvasTkAgg(fig, master=self.right_frame)
            self.hist_canvas.draw()
            self.hist_canvas.get_tk_widget().pack(side=tk.TOP, fill=tk.BOTH, expand=True)
        elif plot_type == "density":
            if self.density_canvas:
                self.density_canvas.get_tk_widget().destroy()
            self.density_canvas = FigureCanvasTkAgg(fig, master=self.right_frame)
            self.density_canvas.draw()
            self.density_canvas.get_tk_widget().pack(side=tk.BOTTOM, fill=tk.BOTH, expand=True)

if __name__ == "__main__":
    root = tk.Tk()
    app = ExcelApp(root)
    root.mainloop()
