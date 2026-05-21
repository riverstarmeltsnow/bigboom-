"""5道进阶题，直接运行看答案"""
# ===== 题 1：嵌套循环 =====
print("=== 题 1 ===")
for i in range(1, 4):
    line = ""
    for j in range(1, i + 1):
        line += str(j) + " "
    print(line)

# ===== 题 2：列表 += 和 append 的区别 =====
print("\n=== 题 2 ===")
a = [1, 2]
b = [3, 4]
a.append(b)
print(a)  # 输出1

c = [1, 2]
d = [3, 4]
c += d
print(c)  # 输出2

# ===== 题 3：continue 和 break =====
print("\n=== 题 3 ===")
for n in range(10):
    if n % 2 == 0:
        continue
    if n > 6:
        break
    print(n, end=" ")

# ===== 题 4：函数默认参数陷阱 =====
print("\n\n=== 题 4 ===")
def add_item(item, items=[]):
    items.append(item)
    return items

print(add_item("a"))     # 调用1
print(add_item("b"))     # 调用2
print(add_item("c", [])) # 调用3

# ===== 题 5：字典操作 =====
print("\n=== 题 5 ===")
scores = {"语文": 80, "数学": 90}
scores["英语"] = 85
scores["数学"] = 95
del scores["语文"]
print(len(scores))
print(list(scores.keys()))
