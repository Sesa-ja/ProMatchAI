# ProMatchAI Mathematical Models and Formulas

## Placement in the Main Report

Use the formulas in the report as follows:

- Put **Sections 1 to 5** in `Chapter 3 -> 3.6.1 Mathematical Formulation of the AI Recommendation System`.
- Put **Section 6** in `Chapter 4 -> Evaluation Metrics` or in the Appendix.
- Put **Section 7** in the Appendix under `Future Mathematical Improvements`.

---

## 1. Core Sets and Representations

### Candidate and Opportunity Sets

$$
\mathcal{C} = \{C_1, C_2, \dots, C_m\}
$$

$$
\mathcal{O} = \{O_1, O_2, \dots, O_n\}
$$

### Candidate Representation

$$
C = \{S_c, L_c, E_c, T_c, B_c, I_c, P_c, W_c, X_c, G_c\}
$$

### Opportunity Representation

$$
O = \{S_r, S_p, L_r, E_r, T_r, B_r, K_o, W_o, X_o, G_o, \tau\}
$$

### Feature-Vector Representation

$$
\phi(C) =
\Big[
\phi_S(C),\,
\phi_L(C),\,
\phi_E(C),\,
\phi_T(C),\,
\phi_B(C),\,
\phi_I(C),\,
\phi_P(C),\,
\phi_W(C),\,
\phi_G(C),\,
\phi_X(C)
\Big]
$$

$$
\phi(O) =
\Big[
\phi_{S_r}(O),\,
\phi_{S_p}(O),\,
\phi_{L_r}(O),\,
\phi_{E_r}(O),\,
\phi_{T_r}(O),\,
\phi_{B_r}(O),\,
\phi_{K_o}(O),\,
\phi_{W_o}(O),\,
\phi_{G_o}(O),\,
\phi_{X_o}(O)
\Big]
$$

### Textual Feature Vectors

$$
X_c = \text{bio} + \text{summary} + \text{skills text} + \text{experience text} + \text{interests text}
$$

$$
X_o = \text{company description} + \text{job description} + \text{required skills text} + \text{preferred skills text} + \text{category text}
$$

$$
V = \{t_1, t_2, \dots, t_p\}
$$

$$
\mathbf{v}_c = [w_{c1}, w_{c2}, \dots, w_{cp}]
$$

$$
\mathbf{v}_o = [w_{o1}, w_{o2}, \dots, w_{op}]
$$

---

## 2. Similarity and Matching Formulas

### Cosine Similarity

$$
\operatorname{CosSim}(\mathbf{x},\mathbf{y}) =
\frac{\mathbf{x}\cdot\mathbf{y}}
{\|\mathbf{x}\|\,\|\mathbf{y}\|}
$$

$$
\operatorname{CosSim}(C,O) =
\frac{\mathbf{v}_c \cdot \mathbf{v}_o}
{\|\mathbf{v}_c\|\,\|\mathbf{v}_o\|}
$$

### Euclidean Distance

$$
d_E(\mathbf{x},\mathbf{y}) = \sqrt{\sum_{i=1}^{n}(x_i-y_i)^2}
$$

### Jaccard Similarity

$$
J(A,B)=\frac{|A\cap B|}{|A\cup B|}
$$

$$
J(S_c,S_r)=\frac{|S_c\cap S_r|}{|S_c\cup S_r|}
$$

### Overlap Count

$$
\operatorname{overlapCount}(A,B)=\sum_{a\in A}\mathbf{1}\left[\exists b\in B:\operatorname{match}(a,b)=1\right]
$$

### Overlap Ratio

$$
\rho(A,B)=
\begin{cases}
1, & |B|=0 \text{ and } |A|>0 \\
0.5, & |A|=0 \text{ and } |B|=0 \\
\min\left(1,\frac{\operatorname{overlapCount}(A,B)}{|B|}\right), & |B|>0
\end{cases}
$$

---

## 3. Hard Filters and Feature Scores

### Hard-Filter Function

$$
H(C,O)=
\begin{cases}
1, & h_1 \land h_2 \land h_3 \\
0, & \text{otherwise}
\end{cases}
$$

### Language Condition

$$
h_1 : \operatorname{overlapCount}(L_c,L_r)\geq |L_r|
$$

### Location Condition

$$
h_2 :
\begin{cases}
\operatorname{loc}(C)=\operatorname{loc}(O), & \text{if exact location is mandatory} \\
1, & \text{otherwise}
\end{cases}
$$

### Required Skill Threshold

$$
h_3 : \operatorname{overlapCount}(S_c,S_r)\geq \tau
$$

### Skill Score

$$
\operatorname{SkillReq}(C,O)=\rho(S_c,S_r)
$$

$$
\operatorname{SkillPref}(C,O)=
\begin{cases}
\rho(S_c,S_p), & |S_p|>0 \\
\operatorname{SkillReq}(C,O), & |S_p|=0
\end{cases}
$$

$$
\operatorname{SkillScore}(C,O)=\frac{\operatorname{SkillReq}(C,O)+\operatorname{SkillPref}(C,O)}{2}
$$

### Language Score

$$
\operatorname{LanguageScore}(C,O)=\rho(L_c,L_r)
$$

### Experience and Training Score

$$
\operatorname{ExperienceScore}(C,O)=
\begin{cases}
1, & E_r\leq 0 \text{ and } n_E>0 \\
0.5, & E_r\leq 0 \text{ and } n_E=0 \\
\min\left(1,\frac{n_E}{E_r}\right), & E_r>0
\end{cases}
$$

$$
\operatorname{TrainingScore}(C,O)=\rho(T_c,T_r)
$$

$$
\operatorname{ExpTrainScore}(C,O)=
\begin{cases}
\operatorname{ExperienceScore}(C,O), & |T_r|=0 \\
\frac{\operatorname{ExperienceScore}(C,O)+\operatorname{TrainingScore}(C,O)}{2}, & |T_r|>0
\end{cases}
$$

### Location Score

$$
\operatorname{LocationScore}(C,O)=
\begin{cases}
1, & W_o=\text{remote} \\
0.5, & G_c \text{ or } G_o \text{ missing} \\
1, & G_c=G_o \\
0.85, & G_c \subseteq G_o \text{ or } G_o \subseteq G_c \\
0.6, & W_o=\text{hybrid and exact match fails} \\
0, & \text{otherwise}
\end{cases}
$$

### Preference-Category Score

$$
Q_c = I_c \cup P_c
$$

$$
Q_o = K_o \cup \{W_o\}
$$

$$
\operatorname{PreferenceScore}(C,O)=\rho(Q_c,Q_o)
$$

### Badge Score

$$
\operatorname{BadgeScore}(C,O)=\rho(B_c,B_r)
$$

---

## 4. Final Scoring and Ranking Formulas

### Weights

$$
w_s = 0.40,\quad
w_l = 0.15,\quad
w_e = 0.15,\quad
w_g = 0.10,\quad
w_p = 0.10,\quad
w_b = 0.05,\quad
w_t = 0.05
$$

### Structured Score

$$
\operatorname{Structured}(C,O)=
w_s\operatorname{SkillScore}(C,O)+
w_l\operatorname{LanguageScore}(C,O)+
w_e\operatorname{ExpTrainScore}(C,O)+
w_g\operatorname{LocationScore}(C,O)+
w_p\operatorname{PreferenceScore}(C,O)+
w_b\operatorname{BadgeScore}(C,O)
$$

### Directional Score

$$
\operatorname{DirScore}(C,O)=\operatorname{Structured}(C,O)+w_t\operatorname{CosSim}(C,O)
$$

### Final Reciprocal Score

$$
f(C,O)=
H(C,O)\cdot
\sqrt{
\operatorname{DirScore}(C,O)\operatorname{DirScore}(O,C)
}
$$

### Top-\(K\) Ranking

$$
\operatorname{TopK}(C_i) = \arg\max_{O_j \in \mathcal{O}}^{K} f(C_i, O_j)
$$

### User-Facing Match Percentage

$$
\operatorname{MatchPercent}(C,O)=
\begin{cases}
\operatorname{round}\left(\frac{|S_c\cap S_r|}{|S_r|}\times 100\right), & |S_r|>0 \\
50, & |S_r|=0
\end{cases}
$$

### Confidence Category

$$
\operatorname{Confidence}(m)=
\begin{cases}
\text{high}, & m \geq 70 \\
\text{medium}, & 50 \leq m < 70 \\
\text{low}, & m < 50
\end{cases}
$$

---

## 5. Content-Based Model Formula

### Implemented Recommendation Mapping

$$
f : \mathcal{C} \times \mathcal{O} \rightarrow [0,1]
$$

$$
f(C,O)=g(\phi(C),\phi(O))
$$

### Predicted Match Strength

$$
\hat{y}_{C,O}=f(C,O)
$$

### Optional Future Logistic Regression Extension

$$
y_{C,O}\in\{0,1\}
$$

$$
P(y_{C,O}=1\mid \mathbf{x}_{C,O}) = \sigma(\mathbf{w}^\top \mathbf{x}_{C,O}+b)
$$

$$
\sigma(z)=\frac{1}{1+e^{-z}}
$$

$$
\mathcal{L}(\mathbf{w},b)=
-\sum_{(C,O)}
\left[
y_{C,O}\log \hat{y}_{C,O} + (1-y_{C,O})\log(1-\hat{y}_{C,O})
\right]
$$

### Optional Probability Interpretation

$$
\hat{P}(\text{match}\mid C,O)\approx f(C,O)
$$

$$
P(M=1 \mid S,L,E,T,B,K,G,W,X)
$$

$$
P(M=1 \mid \mathbf{x}) =
\frac{P(\mathbf{x}\mid M=1)P(M=1)}
{P(\mathbf{x})}
$$

---

## 6. Evaluation Metric Formulas

### Accuracy

$$
\operatorname{Accuracy}=
\frac{TP+TN}{TP+TN+FP+FN}
$$

### Precision

$$
\operatorname{Precision}=
\frac{TP}{TP+FP}
$$

### Recall

$$
\operatorname{Recall}=
\frac{TP}{TP+FN}
$$

### F1-Score

$$
F_1=
2\cdot
\frac{\operatorname{Precision}\cdot \operatorname{Recall}}
{\operatorname{Precision}+\operatorname{Recall}}
$$

### Mean Absolute Error

$$
\operatorname{MAE}=
\frac{1}{N}\sum_{i=1}^{N}|\hat{y}_i-y_i|
$$

### Root Mean Squared Error

$$
\operatorname{RMSE}=
\sqrt{
\frac{1}{N}\sum_{i=1}^{N}(\hat{y}_i-y_i)^2
}
$$

### Precision@\(\boldsymbol{K}\)

$$
\operatorname{Precision@K}=
\frac{\#\{\text{relevant items in top-}K\}}{K}
$$

### Recall@\(\boldsymbol{K}\)

$$
\operatorname{Recall@K}=
\frac{\#\{\text{relevant items in top-}K\}}{\#\{\text{all relevant items}\}}
$$

---

## 7. Optimization Formulas for Future Work

### Weight Vector

$$
\mathbf{w} = [0.40, 0.15, 0.15, 0.10, 0.10, 0.05, 0.05]
$$

### Weight-Tuning Objective

$$
\min_{\mathbf{w}} \sum_{i=1}^{N}\left(\hat{y}_i(\mathbf{w})-y_i\right)^2
$$

subject to:

$$
w_k \geq 0,\qquad \sum_{k=1}^{7} w_k = 1
$$

### Regularized Objective

$$
\mathcal{L}_{reg}=
\mathcal{L}+\lambda\|\mathbf{w}\|_2^2
$$

### Fairness-Aware Objective

$$
\min \left(\mathcal{L} + \gamma \mathcal{F}\right)
$$

### Embedding-Based Semantic Similarity

$$
\mathbf{z}_c = \operatorname{Embed}(X_c), \qquad \mathbf{z}_o = \operatorname{Embed}(X_o)
$$

$$
\operatorname{Sim}_{embed}(C,O)=
\frac{\mathbf{z}_c \cdot \mathbf{z}_o}
{\|\mathbf{z}_c\|\,\|\mathbf{z}_o\|}
$$

### Dynamic Threshold

$$
\tau = \tau(O)
$$

---

## Core Formula to Highlight in the Main Report

$$
f(C,O)=
H(C,O)\cdot
\sqrt{
\left[\operatorname{Structured}(C,O)+w_t\operatorname{CosSim}(C,O)\right]
\left[\operatorname{Structured}(O,C)+w_t\operatorname{CosSim}(O,C)\right]
}
$$
